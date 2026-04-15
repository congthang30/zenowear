import { ApiProperty } from '@nestjs/swagger';

export class ProductVariantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  attributes!: { key: string; value: string }[];

  @ApiProperty()
  originalPrice!: number;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  stock!: number;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  images?: string[];
}

export class ProductResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  barcode!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  isFeatured!: boolean;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty()
  totalSold!: number;

  @ApiProperty()
  ratingAverage!: number;

  @ApiProperty()
  reviewCount!: number;

  @ApiProperty()
  ratingTotal!: number;

  @ApiProperty()
  tags!: string[];

  @ApiProperty()
  brandId!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  images?: string[];

  @ApiProperty()
  videoUrl?: string;

  @ApiProperty({ type: [ProductVariantResponseDto] })
  variants?: ProductVariantResponseDto[];
}

export class PaginatedProductResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data!: ProductResponseDto[];

  @ApiProperty()
  total!: number;
}
