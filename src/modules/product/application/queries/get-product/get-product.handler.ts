import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { GetProductQuery } from './get-product.query';
import {
  ProductResponseDto,
  ProductVariantResponseDto,
} from '../../dtos/product-response.dto';
import { ProductStatus } from '../../../domain/enum/productStatus.enum';

@Injectable()
export class GetProductHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductQuery): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(query.id);
    if (!product?.id) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${query.id}`);
    }
    if (product.deletedAt || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${query.id}`);
    }

    const variants = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );

    const variantDtos: ProductVariantResponseDto[] = variants.map((v) => ({
      id: v.id!,
      productId: v.productId,
      sku: v.sku.value,
      attributes: v.attributes,
      originalPrice: v.originalPrice.value,
      price: v.price.value,
      stock: v.stock.available,
      isDefault: v.isDefault,
      images: v.images,
    }));

    return {
      id: product.id!,
      productName: product.productName.value,
      slug: product.slug.value,
      barcode: product.barcode.value,
      description: product.description,
      status: product.status,
      isFeatured: product.isFeatured,
      viewCount: product.viewCount,
      totalSold: product.totalSold,
      ratingAverage: product.ratingAverage,
      reviewCount: product.reviewCount,
      ratingTotal: product.ratingTotal,
      tags: product.tags,
      brandId: product.brandId,
      categoryId: product.categoryId,
      images: product.images,
      videoUrl: product.videoUrl,
      deletedAt: null,
      variants: variantDtos,
    };
  }
}
