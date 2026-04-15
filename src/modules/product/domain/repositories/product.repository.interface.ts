import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

export interface IProductRepository {
  /** Trả về id đã ghi (ObjectId dạng string). */
  save(product: Product): Promise<string>;
  saveVariant(variant: ProductVariant): Promise<void>;
  saveVariants(variants: ProductVariant[]): Promise<void>;

  /**
   * Ghi product và variants trong một transaction (MongoDB cần replica set).
   */
  saveProductWithVariants(
    product: Product,
    buildVariants: (productId: string) => ProductVariant[],
  ): Promise<string>;

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
