import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { AddProductVariantCommand } from './add-product-variant.command';
import {
  parseOriginalPrice,
  parsePrice,
  parseSku,
  parseStock,
} from '../../parse-product-value-objects';
import { ProductVariant } from '../../../domain/entities/product-variant.entity';
import { reconcileProductStatusFromVariants } from '../../helpers/product-catalog-rules';

@Injectable()
export class AddProductVariantHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: AddProductVariantCommand): Promise<string> {
    const product = await this.productRepository.findById(command.productId);
    if (!product?.id || product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.productId}`);
    }

    const skuVo = parseSku(command.sku);
    if (await this.productRepository.existsBySku(skuVo.value)) {
      throw new ConflictException(`SKU "${skuVo.value}" đã tồn tại`);
    }

    const existing = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    const hasDefault = existing.some((v) => v.isDefault);
    if (!command.isDefault && !hasDefault && existing.length > 0) {
      throw new BadRequestException(
        'Sản phẩm chưa có biến thể mặc định; gửi isDefault: true cho biến thể này',
      );
    }

    let variant: ProductVariant;
    try {
      variant = ProductVariant.create({
        productId: product.id!,
        sku: skuVo,
        attributes: command.attributes,
        originalPrice: parseOriginalPrice(command.originalPrice),
        price: parsePrice(command.price),
        stock: parseStock(command.stock),
        isDefault: command.isDefault,
        images: command.images,
      });
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    await this.productRepository.saveVariant(variant);

    const reloaded = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    const saved = reloaded.find((v) => v.sku.value === skuVo.value);
    if (!saved?.id) {
      throw new BadRequestException('Không lưu được biến thể');
    }

    if (command.isDefault) {
      await this.productRepository.clearDefaultVariantsExcept(
        product.id!,
        saved.id,
      );
    }

    const variants = await this.productRepository.findVariantsByProductId(
      product.id!,
      { includeDeleted: false },
    );
    reconcileProductStatusFromVariants(product, variants);
    await this.productRepository.save(product);

    return saved.id;
  }
}
