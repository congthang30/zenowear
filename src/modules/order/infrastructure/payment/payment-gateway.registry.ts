import { BadRequestException, Injectable } from '@nestjs/common';
import type { IPaymentGatewayStrategy } from './payment-gateway.interface';
import { VnpayPaymentStrategy } from './vnpay-payment.strategy';
import { MomoPaymentStrategy } from './momo-payment.strategy';

@Injectable()
export class PaymentGatewayRegistry {
  private readonly byCode: Map<string, IPaymentGatewayStrategy>;

  constructor(
    private readonly vnpay: VnpayPaymentStrategy,
    private readonly momo: MomoPaymentStrategy,
  ) {
    const strategies: IPaymentGatewayStrategy[] = [vnpay, momo];
    this.byCode = new Map(
      strategies.map((s) => [s.gatewayCode.trim().toUpperCase(), s]),
    );
  }

  /** Mã cổng đang có implementation (dùng cho API / FE). */
  supportedCodes(): string[] {
    return [...this.byCode.keys()].sort();
  }

  get(gateway: string): IPaymentGatewayStrategy {
    const key = String(gateway).trim().toUpperCase();
    const strategy = this.byCode.get(key);
    if (!strategy) {
      const supported = this.supportedCodes().join(', ');
      throw new BadRequestException(
        supported.length
          ? `Cổng thanh toán không hỗ trợ: "${gateway}". Đã đăng ký: ${supported}`
          : `Cổng thanh toán không hỗ trợ: "${gateway}"`,
      );
    }
    return strategy;
  }
}
