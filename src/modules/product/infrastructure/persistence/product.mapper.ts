import { Product } from '../../domain/entities/product.entity';
import { Barcode } from '../../domain/value-objects/barcode.vo';
import { ProductName } from '../../domain/value-objects/productName.vo';
import { Slug } from '../../domain/value-objects/slug.vo';
import { ProductDocument } from './product.orm-entity';

export class ProductMapper {
  static toDomain(doc: ProductDocument): Product {
    return Product.reconstitute({
      id: doc._id.toString(),
      productName: ProductName.reconstitute(doc.productName),
      slug: Slug.reconstitute(doc.slug ?? ''),
      barcode: Barcode.reconstitute(doc.barcode),
      description: doc.description ?? '',
      status: doc.status,
      isFeatured: doc.isFeatured ?? false,
      images: doc.images,
      videoUrl: doc.videoUrl,
      viewCount: doc.viewCount,
      totalSold: doc.totalSold,
      ratingAverage: doc.ratingAverage,
      reviewCount: doc.reviewCount,
      ratingTotal: doc.ratingTotal,
      tags: doc.tags || [],
      brandId: doc.brandId?.toString() ?? '',
      categoryId: doc.categoryId?.toString() ?? '',
      deletedAt: doc.deletedAt,
    });
  }

  static toPersistence(entity: Product): {
    productName: string;
    slug: string;
    barcode: string;
    description: string;
    status: string;
    isFeatured: boolean;
    images: string[];
    videoUrl?: string;
    viewCount: number;
    totalSold: number;
    ratingAverage: number;
    reviewCount: number;
    ratingTotal: number;
    tags: string[];
    brandId: string;
    categoryId: string;
    deletedAt?: Date;
  } {
    return {
      productName: entity.productName.value,
      slug: entity.slug.value,
      barcode: entity.barcode.value,
      description: entity.description,
      status: entity.status,
      isFeatured: entity.isFeatured,
      images: entity.images || [],
      videoUrl: entity.videoUrl,
      viewCount: entity.viewCount,
      totalSold: entity.totalSold,
      ratingAverage: entity.ratingAverage,
      reviewCount: entity.reviewCount,
      ratingTotal: entity.ratingTotal,
      tags: entity.tags,
      brandId: entity.brandId,
      categoryId: entity.categoryId,
      deletedAt: entity.deletedAt,
    };
  }
}
