import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'SALE10' })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  /** Nếu có: kiểm tra theo subtotal tùy chỉnh (không đọc giỏ). Nếu không: dùng giỏ đăng nhập. */
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotalAmount?: number;
}
