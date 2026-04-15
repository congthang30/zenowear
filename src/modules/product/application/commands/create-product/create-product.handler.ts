import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { CreateProductCommand } from './create-product.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductVariant } from '../../../domain/entities/product-variant.entity';
import {
  parseBarcode,
  parseOriginalPrice,
  parsePrice,
  parseProductName,
  parseSku,
  parseSlug,
  parseStock,
} from '../../parse-product-value-objects';
import { BRAND_REPOSITORY } from '../../../../brand/application/brand-repository.token';
import { CATEGORY_REPOSITORY } from '../../../../category/application/category-repository.token';
import type { BrandRepository } from '../../../../brand/domain/repositories/brand.repository';
import type { CategoryRepository } from '../../../../category/domain/repositories/category.repository';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import { BrandStatus } from '../../../../brand/domain/enum/brand-status.enum';
import { CategoryStatus } from '../../../../category/domain/enum/category-status.enum';
import { ProductStatus } from '../../../domain/enum/productStatus.enum';
import {
  assertDistinctSkusInPayload,
  assertExactlyOneDefaultVariant,
  reconcileProductStatusFromVariants,
} from '../../helpers/product-catalog-rules';

@Injectable()
export class CreateProductHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const brand = await this.brandRepository.findById(command.brandId);
    if (!brand) {
      throw new NotFoundException(`Brand không tồn tại: ${command.brandId}`);
    }
    if (brand.status !== BrandStatus.ACTIVE) {
      throw new BadRequestException('Brand phải đang ACTIVE');
    }

    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException(
        `Category không tồn tại: ${command.categoryId}`,
      );
    }
    if (category.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestException('Danh mục phải đang ACTIVE');
    }

    assertExactlyOneDefaultVariant(command.variants);
    assertDistinctSkusInPayload(command.variants.map((v) => v.sku));

    try {
      const productName = parseProductName(command.productName);
      const barcode = parseBarcode(command.barcode);
      let slugObj = parseSlug(command.productName);
      let tries = 0;
      while (
        (await this.productRepository.existsBySlug(slugObj.value)) &&
        tries < 10
      ) {
        slugObj = parseSlug(
          `${command.productName}-${Math.random().toString(36).slice(2, 8)}`,
        );
        tries++;
      }
      if (await this.productRepository.existsBySlug(slugObj.value)) {
        throw new ConflictException(
          `Không tạo được slug unique cho "${command.productName}"`,
        );
      }

      if (await this.productRepository.existsByBarcode(barcode.value)) {
        throw new ConflictException(`Barcode "${barcode.value}" đã tồn tại`);
      }

      for (const v of command.variants) {
        const sku = parseSku(v.sku);
        if (await this.productRepository.existsBySku(sku.value)) {
          throw new ConflictException(`SKU "${sku.value}" đã tồn tại`);
        }
      }

      const allZero = command.variants.every((v) => v.stock === 0);
      const initialStatus = allZero
        ? ProductStatus.OUT_OF_STOCK
        : ProductStatus.ACTIVE;

      const product = Product.createForNewProduct({
        productName,
        slug: slugObj,
        barcode,
        description: command.description,
        status: initialStatus,
        brandId: command.brandId,
        categoryId: command.categoryId,
        images: command.images,
        videoUrl: command.videoUrl,
      });

      const productId = await this.productRepository.saveProductWithVariants(
        product,
        (pid) =>
          command.variants.map((v) =>
            ProductVariant.create({
              productId: pid,
              sku: parseSku(v.sku),
              attributes: v.attributes,
              originalPrice: parseOriginalPrice(v.originalPrice),
              price: parsePrice(v.price),
              stock: parseStock(v.stock),
              isDefault: v.isDefault,
              images: v.images,
            }),
          ),
      );

      const saved = await this.productRepository.findById(productId);
      const vars = await this.productRepository.findVariantsByProductId(
        productId,
        { includeDeleted: false },
      );
      if (saved) {
        reconcileProductStatusFromVariants(saved, vars);
        await this.productRepository.save(saved);
      }

      return productId;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
