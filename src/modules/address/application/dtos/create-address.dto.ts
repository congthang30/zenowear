import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: '123 Đường ABC' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({ example: 'VN' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}
