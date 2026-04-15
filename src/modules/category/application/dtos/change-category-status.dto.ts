import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

export class ChangeCategoryStatusDto {
  @ApiProperty({ enum: CategoryStatus, example: CategoryStatus.ACTIVE })
  @IsEnum(CategoryStatus)
  @IsNotEmpty()
  status!: CategoryStatus;
}
