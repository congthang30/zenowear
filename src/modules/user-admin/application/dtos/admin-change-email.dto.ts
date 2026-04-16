import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class AdminChangeEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email!: string;
}
