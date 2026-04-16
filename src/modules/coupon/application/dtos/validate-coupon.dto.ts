import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SALE10' })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotalAmount?: number;

  @ApiPropertyOptional({
    description:
      'Không dùng cho chống lạm dụng mã (có thể fake). Server chỉ dùng IP từ edge/proxy (cf-connecting-ip, x-real-ip, trust proxy).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  clientIp?: string;
}
