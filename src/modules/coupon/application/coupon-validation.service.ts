import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CART_REPOSITORY } from '../../cart/application/cart-repository.token';
import type { ICartRepository } from '../../cart/domain/repositories/cart.repository.interface';
import { OrderCheckoutService } from '../../order/application/services/order-checkout.service';
import { COUPON_REPOSITORY } from './coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from './coupon-usage-repository.token';
import type { ICouponRepository } from '../domain/repositories/coupon.repository.interface';
import type { ICouponUsageRepository } from '../domain/repositories/coupon-usage.repository.interface';
import { CouponDiscountService } from '../domain/services/coupon-discount.service';
import type { AppliedCouponInfo } from '../domain/services/coupon-discount.service';
import { hashClientIpForCoupon } from './coupon-ip-hash.util';

export type CouponApplyResult = {
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon: AppliedCouponInfo;
  couponId: string;
};

@Injectable()
export class CouponValidationService {
  private readonly logger = new Logger(CouponValidationService.name);

  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly usageRepository: ICouponUsageRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    private readonly checkout: OrderCheckoutService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Giới hạn số user khác nhau dùng cùng mã từ cùng IP trong cửa sổ thời gian (chống farm acc).
   * Gọi lại trước khi consume để giảm race với bước validate.
   */
  async assertSameIpUserQuota(
    userId: string,
    couponId: string,
    clientIp?: string | null,
  ): Promise<void> {
    const max = this.config.get<number>(
      'coupon.maxDistinctUsersPerCouponPerIpPerWindow',
    );
    if (max == null || max <= 0) {
      return;
    }
    const salt = String(this.config.get<string>('coupon.ipHashSalt') ?? '');
    if (!salt.trim()) {
      this.logger.warn(
        'coupon.ipHashSalt trống — bỏ qua COUPON_MAX_DISTINCT_USERS_PER_IP (đặt COUPON_IP_HASH_SALT)',
      );
      return;
    }
    const ipHash = hashClientIpForCoupon(String(clientIp ?? ''), salt);
    if (!ipHash) {
      return;
    }
    const hours = this.config.get<number>('coupon.ipAbuseWindowHours') ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const users =
      await this.usageRepository.findDistinctUserIdsByCouponAndIpHashSince(
        couponId,
        ipHash,
        since,
      );
    if (users.includes(userId)) {
      return;
    }
    if (users.length >= max) {
      throw new BadRequestException(
        'Quá nhiều tài khoản khác nhau đã dùng mã này từ cùng một mạng. Vui lòng thử sau hoặc liên hệ hỗ trợ.',
      );
    }
  }

  async evaluateForCartUser(
    userId: string,
    code: string,
    clientIp?: string | null,
  ): Promise<CouponApplyResult> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart?.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }
    const items = await this.checkout.buildSnapshotsFromCart(cart);
    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
    return this.evaluateForSubtotal(userId, code, subtotal, clientIp);
  }

  async evaluateForSubtotal(
    userId: string,
    code: string,
    subtotal: number,
    clientIp?: string | null,
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
    await this.assertSameIpUserQuota(userId, coupon.id, clientIp);
    if (
      coupon.usageLimit != null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new BadRequestException('Mã giảm giá đã hết lượt');
    }
    const discountAmount = CouponDiscountService.computeDiscount(like, subtotal);
    const finalAmount = Math.max(0, subtotal - discountAmount);
    const remainingUsesForUser = Math.max(0, coupon.usagePerUser - usedByUser);
    return {
      subtotal,
      discountAmount,
      finalAmount,
      appliedCoupon: CouponDiscountService.buildAppliedInfo(
        coupon.id,
        coupon.code,
        coupon.name,
        like,
        {
          usagePerUser: coupon.usagePerUser,
          remainingUsesForUser,
        },
      ),
      couponId: coupon.id,
    };
  }
}
