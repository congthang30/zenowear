import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandResponseDto {
  @ApiProperty({ example: 'Tạo thương hiệu thành công.' })
  message!: string;
}
