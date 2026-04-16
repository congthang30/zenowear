import { ApiProperty } from '@nestjs/swagger';

export class CouponUsageHistoryItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  couponId!: string;

  @ApiProperty()
  couponCode!: string;

  @ApiProperty()
  couponName!: string;

  @ApiProperty()
  usedAt!: string;
}
