import { BadRequestException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { ProductStatus } from '../../domain/enum/productStatus.enum';

export function reconcileProductStatusFromVariants(
  product: Product,
  variants: ProductVariant[],
): void {
  if (product.deletedAt) return;
  if (product.status === ProductStatus.INACTIVE) return;

  const active = variants.filter((v) => !v.deletedAt);
  if (active.length === 0) return;

  const allZero = active.every((v) => v.stock.available === 0);
  if (allZero) {
    product.markAsOutOfStock();
  } else if (product.status === ProductStatus.OUT_OF_STOCK) {
    product.activate();
  }
}

export function assertExactlyOneDefaultVariant<T extends { isDefault: boolean }>(
  variants: T[],
): void {
  const defs = variants.filter((v) => v.isDefault);
  if (defs.length !== 1) {
    throw new BadRequestException(
      'Phải có đúng một biến thể mặc định (isDefault: true)',
    );
  }
}

export function assertDistinctSkusInPayload(skus: string[]): void {
  const seen = new Set<string>();
  for (const s of skus) {
    const k = s.trim().toLowerCase();
    if (seen.has(k)) {
      throw new BadRequestException('SKU trong cùng payload không được trùng');
    }
    seen.add(k);
  }
}
