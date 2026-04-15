import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

export const PRODUCT_REPOSITORY_TOKEN = Symbol('PRODUCT_REPOSITORY_TOKEN');

export interface IProductRepository {
  save(product: Product): Promise<void>;
  saveVariant(variant: ProductVariant): Promise<void>;
  saveVariants(variants: ProductVariant[]): Promise<void>;

  findById(id: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  existsBySlug(slug: string): Promise<boolean>;
  findVariantById(id: string): Promise<ProductVariant | null>;
  findVariantsByProductId(productId: string): Promise<ProductVariant[]>;

  findAll(
    skip: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }>;
}
