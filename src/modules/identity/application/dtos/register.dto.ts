/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Str0ngP@ssw0rd', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Re-enter password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  rePassword: string;

  @ApiProperty({ example: 'Nguyễn Văn A', minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName: string;

  @ApiProperty({ example: '1990-05-15', type: String, format: 'date' })
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date;
}
