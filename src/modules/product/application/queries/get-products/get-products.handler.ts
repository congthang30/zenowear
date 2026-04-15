import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { GetProductsQuery } from './get-products.query';
import {
  PaginatedProductResponseDto,
  ProductResponseDto,
} from '../../dtos/product-response.dto';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';

@Injectable()
export class GetProductsHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductsQuery): Promise<PaginatedProductResponseDto> {
    const { page, limit } = query;

    const { data, total } = await this.productRepository.search({
      page,
      limit,
      search: query.search,
      brandId: query.brandId,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      catalogOnly: query.catalogOnly,
    });

    const productDtos: ProductResponseDto[] = data.map((product) => ({
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
      deletedAt: product.deletedAt?.toISOString() ?? null,
    }));

    return { data: productDtos, total };
  }
}
