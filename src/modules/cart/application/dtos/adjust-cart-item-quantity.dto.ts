import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

/** `delta` > 0 tăng, < 0 giảm (xóa dòng nếu số lượng về 0). */
export class AdjustCartItemQuantityDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: '507f191e810c19729de860ea' })
  @IsOptional()
  @IsMongoId()
  variantId?: string;

  @ApiProperty({
    example: 1,
    description: 'Số lượng cộng thêm (dương) hoặc trừ đi (âm)',
  })
  @IsInt()
  delta!: number;
}
