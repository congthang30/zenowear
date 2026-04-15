import { ApiProperty } from '@nestjs/swagger';

export class AddVariantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Đã thêm biến thể.' })
  message!: string;
}
