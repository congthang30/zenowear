import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVariantAttributeDto } from './create-product.dto';

export class AddVariantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ type: [CreateVariantAttributeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantAttributeDto)
  attributes!: CreateVariantAttributeDto[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  originalPrice!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty()
  @IsBoolean()
  isDefault!: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
