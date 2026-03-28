import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Đăng ký thành công.' })
  message: string;
}
