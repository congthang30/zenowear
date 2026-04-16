import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CART_REPOSITORY } from '../../../../cart/application/cart-repository.token';
import type { ICartRepository } from '../../../../cart/domain/repositories/cart.repository.interface';
import { OrderCheckoutService } from '../../services/order-checkout.service';
import { PreviewOrderCommand } from './preview-order.command';
import type {
  AppliedCouponPreviewDto,
  OrderPreviewResponseDto,
} from '../../dtos/order-response.dto';
import { CouponValidationService } from '../../../../coupon/application/coupon-validation.service';

@Injectable()
export class PreviewOrderHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly checkout: OrderCheckoutService,
    private readonly couponValidation: CouponValidationService,
  ) {}

  async execute(
    command: PreviewOrderCommand,
  ): Promise<OrderPreviewResponseDto> {
    const cart = await this.cartRepository.findByUserId(command.userId);
    if (!cart?.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const items = await this.checkout.buildSnapshotsFromCart(cart);
    const totalAmount = items.reduce((s, i) => s + i.totalPrice, 0);
    let discount = Math.max(0, command.discountAmount ?? 0);
    let appliedCoupon: AppliedCouponPreviewDto | undefined;
    if (command.couponCode?.trim()) {
      const q = await this.couponValidation.evaluateForSubtotal(
        command.userId,
        command.couponCode,
        totalAmount,
        command.couponAntiAbuseClientIp,
      );
      discount = q.discountAmount;
      appliedCoupon = q.appliedCoupon;
    } else if (discount > totalAmount) {
      throw new BadRequestException('Giảm giá không được vượt tổng tiền hàng');
    }
    if (discount > totalAmount) {
      throw new BadRequestException('Giảm giá không được vượt tổng tiền hàng');
    }
    const finalAmount = totalAmount - discount;

    return {
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantAttributes: i.variantAttributes,
        price: i.price,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      totalAmount,
      discountAmount: discount,
      finalAmount,
      ...(appliedCoupon ? { appliedCoupon } : {}),
    };
  }
}
