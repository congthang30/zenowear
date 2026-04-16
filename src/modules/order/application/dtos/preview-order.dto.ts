import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class PreviewOrderDto {
  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Nếu có: ưu tiên giảm theo mã (bỏ discountAmount thủ công)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  couponCode?: string;

  @ApiPropertyOptional({
    description:
      'Không còn dùng cho giới hạn mã (tránh fake IP). Server chỉ lấy IP từ proxy/header tin cậy.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  clientIp?: string;
}
