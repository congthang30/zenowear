import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type {
  InitOnlinePaymentInput,
  InitOnlinePaymentResult,
  IPaymentGatewayStrategy,
} from './payment-gateway.interface';

function formatVnpDate(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}

@Injectable()
export class VnpayPaymentStrategy implements IPaymentGatewayStrategy {
  readonly gatewayCode = 'VNPAY';

  constructor(private readonly config: ConfigService) {}

  async buildPaymentUrl(
    input: InitOnlinePaymentInput,
  ): Promise<InitOnlinePaymentResult> {
    const tmn = this.config.get<string>('vnpay.tmnCode', '');
    const secret = this.config.get<string>('vnpay.hashSecret', '');
    const base = this.config.get<string>('vnpay.paymentUrl', '');
    if (!tmn || !secret || !base) {
      throw new BadRequestException('VNPay chưa được cấu hình (VPAY_*)');
    }

    const vnp_Params: Record<string, string> = {
      vnp_Version: this.config.get<string>('vnpay.version', '2.1.0'),
      vnp_Command: this.config.get<string>('vnpay.command', 'pay'),
      vnp_TmnCode: tmn,
      vnp_Amount: String(Math.round(input.amount) * 100),
      vnp_CurrCode: this.config.get<string>('vnpay.currCode', 'VND'),
      vnp_TxnRef: input.orderId,
      vnp_OrderInfo: input.orderDescription.slice(0, 255),
      vnp_OrderType: 'other',
      vnp_Locale: this.config.get<string>('vnpay.locale', 'vn'),
      vnp_ReturnUrl: input.returnUrl,
      vnp_IpAddr: input.clientIp?.trim() || '127.0.0.1',
      vnp_CreateDate: formatVnpDate(),
    };

    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map((k) => `${k}=${vnp_Params[k]}`).join('&');
    const secureHash = crypto
      .createHmac('sha512', secret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const qs = sortedKeys
      .map((k) => `${k}=${encodeURIComponent(vnp_Params[k])}`)
      .join('&');
    const redirectUrl = `${base}?${qs}&vnp_SecureHash=${secureHash}`;
    return { redirectUrl };
  }
}
