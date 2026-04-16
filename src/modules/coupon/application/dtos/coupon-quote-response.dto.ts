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

  @ApiProperty({
    description:
      'Mỗi tài khoản tối đa dùng mã cho bao nhiêu đơn thành công (sau khi tạo đơn)',
  })
  usagePerUser!: number;

  @ApiProperty({
    description:
      'Ước tính lượt còn lại cho user này trước đơn hiện tại (chưa trừ đơn đang đặt)',
  })
  remainingUsesForUser!: number;
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
