import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

export class CategoryTreeNodeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  parentId!: string | null;

  @ApiProperty({ enum: CategoryStatus })
  status!: CategoryStatus;

  @ApiProperty({ type: [CategoryTreeNodeDto] })
  children!: CategoryTreeNodeDto[];
}
