import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Điện thoại', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: '507f191e810c19729de860ea',
    description: 'Danh mục cha (MongoId). Bỏ qua nếu là gốc.',
  })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({
    enum: CategoryStatus,
    default: CategoryStatus.DRAFT,
    description: 'Mặc định DRAFT. ACTIVE chỉ khi cha (nếu có) đang ACTIVE.',
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}
