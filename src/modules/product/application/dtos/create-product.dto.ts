import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantAttributeDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ example: 'Red' })
  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class CreateVariantDto {
  @ApiProperty({ example: 'SKU-123' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ type: [CreateVariantAttributeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantAttributeDto)
  attributes!: CreateVariantAttributeDto[];

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  originalPrice!: number;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isDefault!: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class CreateProductDto {
  @ApiProperty({ example: 'Áo thun nam' })
  @IsString()
  @IsNotEmpty()
  productName!: string;

  @ApiProperty({ example: '8935244800001' })
  @IsString()
  @IsNotEmpty()
  barcode!: string;

  @ApiPropertyOptional({ example: 'Áo thun nam chất liệu cotton 100%' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '60d5ecb8b392d7001f3e1234' })
  @IsMongoId()
  @IsNotEmpty()
  brandId!: string;

  @ApiProperty({ example: '60d5ecb8b392d7001f3e5678' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=123' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants!: CreateVariantDto[];
}
