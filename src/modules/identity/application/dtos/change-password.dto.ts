import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Mật khẩu hiện tại' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Mật khẩu mới' })
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'Nhập lại mật khẩu mới' })
  @IsString()
  reNewPassword: string;
}
