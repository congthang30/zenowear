import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { MarkProductFeaturedCommand } from './mark-product-featured.command';

@Injectable()
export class MarkProductFeaturedHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: MarkProductFeaturedCommand): Promise<void> {
    const product = await this.productRepository.findById(command.id);
    if (!product?.id || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.id}`);
    }
    product.setFeatured(command.isFeatured);
    await this.productRepository.save(product);
  }
}
