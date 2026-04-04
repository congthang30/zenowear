import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsEnum } from 'class-validator';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Điện thoại',
    maxLength: 254,
  })
  @IsString()
  @MaxLength(254)
  categoryName: string;

  @ApiProperty({
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE,
  })
  @IsEnum(CategoryStatus)
  categoryStatus: CategoryStatus;
}
