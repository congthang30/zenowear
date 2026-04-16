import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import type {
  InitOnlinePaymentInput,
  InitOnlinePaymentResult,
  IPaymentGatewayStrategy,
} from './payment-gateway.interface';
import { makeGatewayMerchantOrderId } from './gateway-merchant-order-id';

/** Endpoint chính thức tạo giao dịch MoMo (JSON). Domain gốc không có path sẽ trả HTML. */
const MOMO_CREATE_PATH = '/v2/gateway/api/create';

function assertMomoCreateApiUrl(apiUrl: string): void {
  const trimmed = apiUrl.trim();
  if (!trimmed) {
    return;
  }
  try {
    const u = new URL(trimmed);
    if (!u.pathname.replace(/\/+$/, '').endsWith(MOMO_CREATE_PATH)) {
      throw new BadRequestException(
        `MOMO_API_URL phải kết thúc bằng ${MOMO_CREATE_PATH}. ` +
          'Sandbox: https://test-payment.momo.vn/v2/gateway/api/create — ' +
          'Production: https://payment.momo.vn/v2/gateway/api/create. ' +
          'Không dùng chỉ https://payment.momo.vn (trả HTML, không phải API).',
      );
    }
  } catch (e) {
    if (e instanceof BadRequestException) {
      throw e;
    }
    throw new BadRequestException('MOMO_API_URL không phải URL hợp lệ.');
  }
}

@Injectable()
export class MomoPaymentStrategy implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'MOMO';

  constructor(private readonly config: ConfigService) {}

  async buildPaymentUrl(
    input: InitOnlinePaymentInput,
  ): Promise<InitOnlinePaymentResult> {
    const apiUrl = this.config.get<string>('momo.apiUrl', '');
    const accessKey = this.config.get<string>('momo.accessKey', '');
    const secretKey = this.config.get<string>('momo.secretKey', '');
    const partnerCode = this.config.get<string>('momo.partnerCode', 'MOMO');
    const requestType = this.config.get<string>(
      'momo.requestType',
      'captureWallet',
    );

    if (!apiUrl || !accessKey || !secretKey) {
      throw new BadRequestException('MoMo chưa được cấu hình (MOMO_*)');
    }

    assertMomoCreateApiUrl(apiUrl);

    const requestId = randomUUID();
    /** MoMo từ chối nếu tái dùng cùng orderId cho giao dịch chưa kết thúc — mỗi lần tạo link dùng mã duy nhất. */
    const orderId = makeGatewayMerchantOrderId(input.orderId);
    const orderInfo = input.orderDescription.slice(0, 255);
    const amount = String(Math.round(input.amount));
    const redirectUrl = input.returnUrl;
    const ipnUrl = input.ipnUrl ?? input.returnUrl;
    const extraData = '';

    /** Chuỗi ký: các key sort a-z theo tài liệu MoMo (captureWallet). */
    const signatureParams: Record<string, string> = {
      accessKey,
      amount,
      extraData,
      ipnUrl,
      orderId,
      orderInfo,
      partnerCode,
      redirectUrl,
      requestId,
      requestType,
    };
    const rawSignature = Object.keys(signatureParams)
      .sort()
      .map((k) => `${k}=${signatureParams[k]}`)
      .join('&');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    /** `storeName` theo spec MoMo; không gửi `partnerName` (không có trong API → resultCode 20). */
    const body = {
      partnerCode,
      storeName: 'ZenoWear',
      storeId: 'ZenoWearOnline',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      requestType,
      extraData,
      signature,
    };

    let res: Response;
    try {
      res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(`Không gọi được MoMo API: ${msg}`);
    }

    const raw = await res.text();
    const ct = res.headers.get('content-type') ?? '';

    let json: {
      payUrl?: string;
      message?: string;
      resultCode?: number;
    };
    try {
      if (!raw.trimStart().startsWith('{')) {
        throw new SyntaxError('not json');
      }
      json = JSON.parse(raw) as typeof json;
    } catch {
      const hint =
        res.status >= 400
          ? `HTTP ${res.status}. `
          : '';
      throw new BadRequestException(
        `${hint}MoMo trả về không phải JSON (Content-Type: ${ct || 'unknown'}). ` +
          'Kiểm tra MOMO_API_URL — cần endpoint tạo giao dịch (ví dụ sandbox: …/v2/gateway/api/create), không phải trang HTML.',
      );
    }

    if (!res.ok) {
      throw new BadRequestException(
        json.message ??
          `MoMo HTTP ${res.status}${json.resultCode != null ? ` (resultCode=${json.resultCode})` : ''}`,
      );
    }

    if (json.resultCode != null && json.resultCode !== 0) {
      throw new BadRequestException(
        json.message ??
          `MoMo từ chối giao dịch (resultCode=${json.resultCode})`,
      );
    }

    if (!json.payUrl) {
      throw new BadRequestException(
        json.message ?? 'MoMo không trả về payUrl',
      );
    }
    return { redirectUrl: json.payUrl };
  }
}
