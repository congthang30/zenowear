import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../product-repository.token';
import type { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { UpdateProductCommand } from './update-product.command';
import {
  parseBarcode,
  parseProductName,
  parseSlug,
} from '../../parse-product-value-objects';
import { BRAND_REPOSITORY } from '../../../../brand/application/brand-repository.token';
import { CATEGORY_REPOSITORY } from '../../../../category/application/category-repository.token';
import type { BrandRepository } from '../../../../brand/domain/repositories/brand.repository';
import type { CategoryRepository } from '../../../../category/domain/repositories/category.repository';
import { BrandStatus } from '../../../../brand/domain/enum/brand-status.enum';
import { CategoryStatus } from '../../../../category/domain/enum/category-status.enum';

@Injectable()
export class UpdateProductHandler {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<void> {
    const product = await this.productRepository.findById(command.id);
    if (!product?.id) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.id}`);
    }
    if (product.deletedAt) {
      throw new NotFoundException(`Không tìm thấy sản phẩm: ${command.id}`);
    }

    if (command.brandId) {
      const b = await this.brandRepository.findById(command.brandId);
      if (!b) {
        throw new NotFoundException(`Brand không tồn tại: ${command.brandId}`);
      }
      if (b.status !== BrandStatus.ACTIVE) {
        throw new BadRequestException('Brand phải đang ACTIVE');
      }
    }

    if (command.categoryId) {
      const c = await this.categoryRepository.findById(command.categoryId);
      if (!c) {
        throw new NotFoundException(
          `Category không tồn tại: ${command.categoryId}`,
        );
      }
      if (c.status !== CategoryStatus.ACTIVE) {
        throw new BadRequestException('Danh mục phải đang ACTIVE');
      }
    }

    let slugValue: ReturnType<typeof parseSlug> | undefined;
    if (command.slug !== undefined) {
      slugValue = parseSlug(command.slug);
      const taken = await this.productRepository.existsBySlug(
        slugValue.value,
        product.id,
      );
      if (taken) {
        throw new ConflictException(`Slug "${slugValue.value}" đã tồn tại`);
      }
    } else if (command.productName !== undefined) {
      slugValue = parseSlug(command.productName);
      const taken = await this.productRepository.existsBySlug(
        slugValue.value,
        product.id,
      );
      if (taken) {
        slugValue = parseSlug(
          `${command.productName}-${product.id!.slice(-6)}`,
        );
        const taken2 = await this.productRepository.existsBySlug(
          slugValue.value,
          product.id,
        );
        if (taken2) {
          throw new ConflictException(
            'Không thể tạo slug unique từ tên sản phẩm; hãy gửi slug thủ công',
          );
        }
      }
    }

    if (command.barcode !== undefined) {
      const bc = parseBarcode(command.barcode);
      const taken = await this.productRepository.existsByBarcode(
        bc.value,
        product.id,
      );
      if (taken) {
        throw new ConflictException(`Barcode "${bc.value}" đã tồn tại`);
      }
    }

    try {
      product.updateDetails({
        productName:
          command.productName !== undefined
            ? parseProductName(command.productName)
            : undefined,
        slug: slugValue,
        barcode:
          command.barcode !== undefined
            ? parseBarcode(command.barcode)
            : undefined,
        description: command.description,
        tags: command.tags,
        brandId: command.brandId,
        categoryId: command.categoryId,
        images: command.images,
        videoUrl: command.videoUrl,
      });
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    await this.productRepository.save(product);
  }
}
