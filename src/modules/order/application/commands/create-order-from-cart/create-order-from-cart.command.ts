import type { ShippingAddress } from '../../../domain/entities/order.entity';
import { PaymentMethod } from '../../../domain/enum/payment-method.enum';

export class CreateOrderFromCartCommand {
  constructor(
    readonly userId: string,
    readonly paymentMethod: PaymentMethod,
    readonly shippingAddress: ShippingAddress | undefined,
    readonly addressId: string | undefined,
    readonly discountAmount?: number,
    readonly returnUrl?: string,
    readonly clientIp?: string,
    readonly ipnUrl?: string,
    readonly couponCode?: string,
    /** IP từ edge/proxy — coupon consume/validate; không dùng body.clientIp */
    readonly couponAntiAbuseClientIp?: string,
  ) {}
}
