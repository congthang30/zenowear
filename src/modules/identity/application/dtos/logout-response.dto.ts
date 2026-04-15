import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: 'Đăng xuất thành công.' })
  message!: string;
}
