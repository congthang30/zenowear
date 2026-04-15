import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductStatus } from '../../domain/enum/productStatus.enum';

export class ChangeProductStatusDto {
  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status!: ProductStatus;
}
