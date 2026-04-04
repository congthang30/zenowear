import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryResponseDto {
  @ApiProperty({ example: 'Tạo danh mục thành công.' })
  message: string;
}
