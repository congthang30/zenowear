import { PaymentCallbackOutcome } from '../../dtos/payment-callback.dto';

export class PaymentCallbackCommand {
  constructor(
    readonly orderId: string,
    readonly gatewayReference: string,
    readonly outcome: PaymentCallbackOutcome,
  ) {}
}
