import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { DeleteProductVariantCommand } from './delete-product-variant.command';
import { reconcileProductStatusFromVariants } from '../../helpers/product-catalog-rules';

@Injectable()
export class DeleteProductVariantHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductVariantCommand): Promise<void> {
    const product = await this.productRepository.findById(command.productId);
    if (!product?.id || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.productId}`);
    }

    const variant = await this.productRepository.findVariantById(
      command.variantId,
    );
    if (!variant?.id || variant.productId !== product.id || variant.deletedAt) {
      throw new NotFoundException(`Không tìm thấy biến thể: ${command.variantId}`);
    }

    const wasDefault = variant.isDefault;
    variant.markDeleted();
    await this.productRepository.saveVariant(variant);

    const remaining = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );

    if (remaining.length > 0 && wasDefault) {
      const pick = remaining[0];
      pick.update({ isDefault: true });
      await this.productRepository.saveVariant(pick);
      await this.productRepository.clearDefaultVariantsExcept(product.id!, pick.id!);
    }

    const variants = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    reconcileProductStatusFromVariants(product, variants);
    await this.productRepository.save(product);
  }
}
