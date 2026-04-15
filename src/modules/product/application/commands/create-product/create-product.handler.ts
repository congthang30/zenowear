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
      throw new NotFoundException(`Brand with ID ${command.brandId} not found`);
    }

    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException(
        `Category with ID ${command.categoryId} not found`,
      );
    }

    try {
      const productName = parseProductName(command.productName);
      const barcode = parseBarcode(command.barcode);
      const slugObj = parseSlug(command.productName);

      const slugExists = await this.productRepository.existsBySlug(
        slugObj.value,
      );
      if (slugExists) {
        throw new ConflictException(
          `Product slug "${slugObj.value}" already exists. Please choose a different name.`,
        );
      }

      const product = Product.createForNewProduct({
        productName,
        slug: slugObj,
        barcode,
        description: command.description,
        brandId: command.brandId,
        categoryId: command.categoryId,
        images: command.images,
        videoUrl: command.videoUrl,
      });

      return await this.productRepository.saveProductWithVariants(
        product,
        (productId) =>
          command.variants.map((v) =>
            ProductVariant.create({
              productId,
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
