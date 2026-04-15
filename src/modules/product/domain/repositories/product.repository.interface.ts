import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

export type ProductSearchCriteria = {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  catalogOnly: boolean;
};

export interface IProductRepository {
  save(product: Product): Promise<string>;
  saveVariant(variant: ProductVariant): Promise<void>;
  saveVariants(variants: ProductVariant[]): Promise<void>;

  saveProductWithVariants(
    product: Product,
    buildVariants: (productId: string) => ProductVariant[],
  ): Promise<string>;

  findById(id: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  existsBySlug(slug: string, excludeProductId?: string): Promise<boolean>;
  existsByBarcode(barcode: string, excludeProductId?: string): Promise<boolean>;
  existsBySku(sku: string, excludeVariantId?: string): Promise<boolean>;

  findVariantById(id: string): Promise<ProductVariant | null>;
  findVariantsByProductId(
    productId: string,
    options?: { includeDeleted?: boolean },
  ): Promise<ProductVariant[]>;

  search(
    criteria: ProductSearchCriteria,
  ): Promise<{ data: Product[]; total: number }>;

  incrementViewCount(id: string): Promise<boolean>;

  clearDefaultVariantsExcept(
    productId: string,
    exceptVariantId: string,
  ): Promise<void>;
}
