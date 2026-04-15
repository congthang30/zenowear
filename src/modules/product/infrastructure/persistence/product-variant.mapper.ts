import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { OriginalPrice } from '../../domain/value-objects/originalPrice.vo';
import { Price } from '../../domain/value-objects/price.vo';
import { Sku } from '../../domain/value-objects/sku.vo';
import { Stock } from '../../domain/value-objects/stock.vo';
import { ProductVariantDocument } from './product-variant.orm-entity';

export class ProductVariantMapper {
  static toDomain(doc: ProductVariantDocument): ProductVariant {
    return ProductVariant.reconstitute({
      id: doc._id.toHexString(),
      productId: doc.productId.toHexString(),
      sku: Sku.reconstitute(doc.sku),
      attributes: doc.attributes || [],
      originalPrice: OriginalPrice.reconstitute(doc.originalPrice),
      price: Price.reconstitute(doc.price),
      stock: Stock.reconstitute(doc.stock, 0),
      isDefault: doc.isDefault ?? false,
      images: doc.images || [],
      deletedAt: doc.deletedAt,
    });
  }

  static toPersistence(entity: ProductVariant): {
    productId: string;
    sku: string;
    attributes: { key: string; value: string }[];
    originalPrice: number;
    price: number;
    stock: number;
    isDefault: boolean;
    images?: string[];
    deletedAt?: Date;
  } {
    return {
      productId: entity.productId,
      sku: entity.sku.value,
      attributes: entity.attributes,
      originalPrice: entity.originalPrice.value,
      price: entity.price.value,
      stock: entity.stock.available,
      isDefault: entity.isDefault,
      images: entity.images,
      deletedAt: entity.deletedAt,
    };
  }
}
