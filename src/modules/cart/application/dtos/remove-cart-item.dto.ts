import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class RemoveCartItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ example: '507f191e810c19729de860ea' })
  @IsOptional()
  @IsMongoId()
  variantId?: string;
}
