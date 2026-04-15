import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'Tạo thương hiệu thành công.' })
  message!: string;
}
