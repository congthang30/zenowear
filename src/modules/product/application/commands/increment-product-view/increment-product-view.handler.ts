import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { IncrementProductViewCommand } from './increment-product-view.command';

@Injectable()
export class IncrementProductViewHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: IncrementProductViewCommand): Promise<void> {
    const ok = await this.productRepository.incrementViewCount(command.id);
    if (!ok) {
      throw new NotFoundException(
        `Không tìm thấy sản phẩm ACTIVE hoặc đã bị ẩn: ${command.id}`,
      );
    }
  }
}
