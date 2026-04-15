import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Samsung Electronics', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/new-logo.png',
    description: 'Gửi `null` để xóa logo',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  logo?: string | null;

  @ApiPropertyOptional({ maxLength: 2000, description: '`null` để xóa mô tả' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;
}
