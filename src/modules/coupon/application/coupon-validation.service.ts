import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CART_REPOSITORY } from '../../cart/application/cart-repository.token';
import type { ICartRepository } from '../../cart/domain/repositories/cart.repository.interface';
import { OrderCheckoutService } from '../../order/application/services/order-checkout.service';
import { COUPON_REPOSITORY } from './coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from './coupon-usage-repository.token';
import type { ICouponRepository } from '../domain/repositories/coupon.repository.interface';
import type { ICouponUsageRepository } from '../domain/repositories/coupon-usage.repository.interface';
import { CouponDiscountService } from '../domain/services/coupon-discount.service';
import type { AppliedCouponInfo } from '../domain/services/coupon-discount.service';

export type CouponApplyResult = {
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon: AppliedCouponInfo;
  couponId: string;
};

@Injectable()
export class CouponValidationService {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly usageRepository: ICouponUsageRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly checkout: OrderCheckoutService,
  ) {}

  async evaluateForCartUser(
    userId: string,
    code: string,
  ): Promise<CouponApplyResult> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart?.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }
    const items = await this.checkout.buildSnapshotsFromCart(cart);
    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
    return this.evaluateForSubtotal(userId, code, subtotal);
  }

  async evaluateForSubtotal(
    userId: string,
    code: string,
    subtotal: number,
  ): Promise<CouponApplyResult> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new BadRequestException('Mã giảm giá không tồn tại');
    }
    const like = {
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      status: coupon.status,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
    };
    CouponDiscountService.assertUsableForSubtotal(like, subtotal);
    const usedByUser = await this.usageRepository.countByUserAndCoupon(
      userId,
      coupon.id,
    );
    if (usedByUser >= coupon.usagePerUser) {
      throw new BadRequestException('Bạn đã hết lượt dùng mã này');
    }
    if (
      coupon.usageLimit != null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new BadRequestException('Mã giảm giá đã hết lượt');
    }
    const discountAmount = CouponDiscountService.computeDiscount(like, subtotal);
    const finalAmount = Math.max(0, subtotal - discountAmount);
    return {
      subtotal,
      discountAmount,
      finalAmount,
      appliedCoupon: CouponDiscountService.buildAppliedInfo(
        coupon.id,
        coupon.code,
        coupon.name,
        like,
      ),
      couponId: coupon.id,
    };
  }
}
