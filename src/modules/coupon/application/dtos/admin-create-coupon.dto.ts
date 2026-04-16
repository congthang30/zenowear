import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CouponType } from '../../domain/enum/coupon-type.enum';
import { CouponStatus } from '../../domain/enum/coupon-status.enum';

export class AdminCreateCouponDto {
  @ApiProperty({ example: 'SALE10' })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty({ description: 'PERCENT: 1–100; FIXED/FREE_SHIPPING: số tiền' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'null = không giới hạn tối đa giảm' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @ApiPropertyOptional({ enum: CouponStatus, default: CouponStatus.DRAFT })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @ApiPropertyOptional({ description: 'null = không giới hạn tổng hệ thống' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number | null;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usagePerUser?: number;
}
