import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN } from '../../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { CreateProductCommand } from './create-product.command';
import { Product } from '../../../domain/entities/product.entity';
import { ProductVariant } from '../../../domain/entities/product-variant.entity';
import { ProductName } from '../../../domain/value-objects/productName.vo';
import { Slug } from '../../../domain/value-objects/slug.vo';
import { Barcode } from '../../../domain/value-objects/barcode.vo';
import { Sku } from '../../../domain/value-objects/sku.vo';
import { Price } from '../../../domain/value-objects/price.vo';
import { OriginalPrice } from '../../../domain/value-objects/originalPrice.vo';
import { Stock } from '../../../domain/value-objects/stock.vo';
import { BRAND_REPOSITORY } from '../../../../brand/application/category-repository.token';
import { CATEGORY_REPOSITORY } from '../../../../category/application/category-repository.token';
import type { BrandRepository } from '../../../../brand/domain/repositories/brand.repository';
import type { CategoryRepository } from '../../../../category/domain/repositories/category.repository';

@Injectable()
export class CreateProductHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
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
      const productName = ProductName.create(command.productName);
      const barcode = Barcode.create(command.barcode);
      const slugObj = Slug.create(command.productName);

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

      await this.productRepository.save(product);

      const savedProduct = await this.productRepository.findByBarcode(
        command.barcode,
      );

      if (!savedProduct?.id) {
        throw new Error('Product save failed - could not resolve ID');
      }

      const variants = command.variants.map((v) =>
        ProductVariant.create({
          productId: savedProduct.id!,
          sku: Sku.create(v.sku),
          attributes: v.attributes,
          originalPrice: OriginalPrice.create(v.originalPrice),
          price: Price.create(v.price),
          stock: Stock.create(v.stock),
          isDefault: v.isDefault,
          images: v.images,
        }),
      );

      await this.productRepository.saveVariants(variants);

      return savedProduct.id;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error);
    }
  }
}
