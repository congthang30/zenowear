import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { ChangeProductStatusCommand } from './change-product-status.command';
import { reconcileProductStatusFromVariants } from '../../helpers/product-catalog-rules';
import { ProductStatus } from '../../../domain/enum/productStatus.enum';

@Injectable()
export class ChangeProductStatusHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: ChangeProductStatusCommand): Promise<void> {
    const product = await this.productRepository.findById(command.id);
    if (!product?.id || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.id}`);
    }

    if (command.status === ProductStatus.OUT_OF_STOCK) {
      throw new BadRequestException(
        'OUT_OF_STOCK được hệ thống tự đặt khi hết hàng; không đặt thủ công',
      );
    }

    product.applyStatus(command.status);

    const variants = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    reconcileProductStatusFromVariants(product, variants);

    await this.productRepository.save(product);
  }
}
