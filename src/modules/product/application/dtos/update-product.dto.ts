import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  productName?: string;

  @ApiPropertyOptional({ description: 'Slug tùy chỉnh; phải unique' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  videoUrl?: string | null;
}
