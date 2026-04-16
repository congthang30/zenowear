import { PaymentMethod } from '../../../domain/enum/payment-method.enum';

export class ChangeOrderPaymentMethodCommand {
  constructor(
    readonly userId: string,
    readonly orderId: string,
    readonly paymentMethod: PaymentMethod,
    readonly returnUrl?: string,
    readonly clientIp?: string,
    readonly ipnUrl?: string,
  ) {}
}
