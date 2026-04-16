import { Injectable } from '@nestjs/common';
import { CouponValidationService } from '../coupon-validation.service';
import type { CouponQuoteResponseDto } from '../dtos/coupon-quote-response.dto';

@Injectable()
export class ValidateCouponForUserHandler {
  constructor(private readonly couponValidation: CouponValidationService) {}

  async execute(
    userId: string,
    code: string,
    subtotalAmount?: number,
  ): Promise<CouponQuoteResponseDto> {
    const r =
      subtotalAmount != null
        ? await this.couponValidation.evaluateForSubtotal(
            userId,
            code,
            subtotalAmount,
          )
        : await this.couponValidation.evaluateForCartUser(userId, code);
    return {
      subtotal: r.subtotal,
      discountAmount: r.discountAmount,
      finalAmount: r.finalAmount,
      appliedCoupon: r.appliedCoupon,
    };
  }
}
