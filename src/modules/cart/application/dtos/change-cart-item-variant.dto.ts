import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class ChangeCartItemVariantDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({
    description: 'Biến thể hiện tại (bỏ qua nếu sản phẩm không có variant trên dòng)',
  })
  @IsOptional()
  @IsMongoId()
  fromVariantId?: string;

  @ApiPropertyOptional({
    description: 'Biến thể mới (có thể khác from; để đổi sang “không variant” thì không gửi)',
  })
  @IsOptional()
  @IsMongoId()
  toVariantId?: string;
}
