import { ApiProperty } from '@nestjs/swagger';
import { CouponType } from '../../domain/enum/coupon-type.enum';

export class AppliedCouponResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: CouponType })
  type!: CouponType;

  @ApiProperty()
  value!: number;
}

export class CouponQuoteResponseDto {
  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  discountAmount!: number;

  @ApiProperty()
  finalAmount!: number;

  @ApiProperty({ type: AppliedCouponResponseDto })
  appliedCoupon!: AppliedCouponResponseDto;
}
