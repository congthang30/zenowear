import { BadRequestException } from '@nestjs/common';
import { CouponType } from '../enum/coupon-type.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export type CouponLike = {
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  status: CouponStatus;
  startDate: Date;
  endDate: Date;
};

export type AppliedCouponInfo = {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  value: number;
};

export class CouponDiscountService {
  static assertUsableForSubtotal(
    coupon: CouponLike,
    subtotal: number,
    now: Date = new Date(),
  ): void {
    if (coupon.status !== CouponStatus.ACTIVE) {
      throw new BadRequestException('Mã giảm giá không khả dụng');
    }
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new BadRequestException('Mã giảm giá ngoài thời gian hiệu lực');
    }
    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestException(
        `Đơn chưa đạt giá trị tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')} ₫`,
      );
    }
  }

  static computeDiscount(coupon: CouponLike, subtotal: number): number {
    let raw = 0;
    switch (coupon.type) {
      case CouponType.PERCENT: {
        raw = Math.floor((subtotal * coupon.value) / 100);
        break;
      }
      case CouponType.FIXED_AMOUNT:
      case CouponType.FREE_SHIPPING: {
        raw = Math.min(coupon.value, subtotal);
        break;
      }
      default:
        raw = 0;
    }
    const cap =
      coupon.maxDiscountAmount != null && coupon.maxDiscountAmount >= 0
        ? coupon.maxDiscountAmount
        : raw;
    return Math.min(Math.max(0, raw), cap, subtotal);
  }

  static buildAppliedInfo(
    id: string,
    code: string,
    name: string,
    coupon: CouponLike,
  ): AppliedCouponInfo {
    return {
      id,
      code,
      name,
      type: coupon.type,
      value: coupon.value,
    };
  }
}
