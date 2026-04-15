import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { UpdateProductVariantCommand } from './update-product-variant.command';
import {
  parseOriginalPrice,
  parsePrice,
  parseSku,
  parseStock,
} from '../../parse-product-value-objects';
import { reconcileProductStatusFromVariants } from '../../helpers/product-catalog-rules';

@Injectable()
export class UpdateProductVariantHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductVariantCommand): Promise<void> {
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

    if (command.sku !== undefined) {
      const skuVo = parseSku(command.sku);
      if (
        skuVo.value !== variant.sku.value &&
        (await this.productRepository.existsBySku(skuVo.value, variant.id))
      ) {
        throw new ConflictException(`SKU "${skuVo.value}" đã tồn tại`);
      }
    }

    const patch: Parameters<typeof variant.update>[0] = {};
    if (command.sku !== undefined) patch.sku = parseSku(command.sku);
    if (command.attributes !== undefined) patch.attributes = command.attributes;
    if (command.originalPrice !== undefined) {
      patch.originalPrice = parseOriginalPrice(command.originalPrice);
    }
    if (command.price !== undefined) patch.price = parsePrice(command.price);
    if (command.stock !== undefined) patch.stock = parseStock(command.stock);
    if (command.isDefault !== undefined) patch.isDefault = command.isDefault;
    if (command.images !== undefined) patch.images = command.images;

    try {
      variant.update(patch);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    if (command.isDefault === false) {
      const siblings = await this.productRepository.findVariantsByProductId(
        product.id!,
        { includeDeleted: false },
      );
      const othersDefault = siblings.some(
        (v) => v.id !== variant.id && v.isDefault,
      );
      if (!othersDefault) {
        throw new BadRequestException(
          'Phải còn ít nhất một biến thể mặc định khác trước khi bỏ isDefault',
        );
      }
    }

    await this.productRepository.saveVariant(variant);

    if (command.isDefault === true) {
      await this.productRepository.clearDefaultVariantsExcept(
        product.id!,
        variant.id!,
      );
    }

    const variants = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    reconcileProductStatusFromVariants(product, variants);
    await this.productRepository.save(product);
  }
}
