import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CouponStatus } from '../../domain/enum/coupon-status.enum';

export class SetCouponStatusDto {
  @ApiProperty({ enum: CouponStatus })
  @IsEnum(CouponStatus)
  status!: CouponStatus;
}
