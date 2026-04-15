import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

export class CreateBrandDto {
  @ApiProperty({ example: 'Samsung', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/brands/samsung.png',
    description: 'URL ảnh logo',
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  logo?: string;

  @ApiPropertyOptional({
    example: 'Thương hiệu điện tử',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: BrandStatus,
    default: BrandStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(BrandStatus)
  status?: BrandStatus;
}
