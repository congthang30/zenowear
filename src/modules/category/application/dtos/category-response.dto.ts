import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

export class CategoryResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'điện thoại' })
  name!: string;

  @ApiPropertyOptional({
    example: '507f191e810c19729de860ea',
    nullable: true,
    description: 'null nếu là gốc',
  })
  parentId!: string | null;

  @ApiProperty({ enum: CategoryStatus })
  status!: CategoryStatus;

  static fromEntity(c: Category): CategoryResponseDto {
    if (!c.id) {
      throw new Error('Category chưa có id');
    }
    return {
      id: c.id,
      name: c.categoryName.value,
      parentId: c.parentId,
      status: c.status,
    };
  }
}
