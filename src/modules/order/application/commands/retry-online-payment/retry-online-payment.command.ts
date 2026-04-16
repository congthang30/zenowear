import { PaymentMethod } from '../../../domain/enum/payment-method.enum';

export class RetryOnlinePaymentCommand {
  constructor(
    readonly userId: string,
    readonly orderId: string,
    readonly returnUrl?: string,
    readonly paymentMethod?: PaymentMethod,
    readonly clientIp?: string,
    readonly ipnUrl?: string,
  ) {}
}
