import { ApiProperty } from '@nestjs/swagger';

export class CreateProductResponseDto {
  @ApiProperty({ example: '60d5ecb8b392d7001f3e1234' })
  id!: string;

  @ApiProperty({ example: 'Tạo sản phẩm thành công.' })
  message!: string;
}
