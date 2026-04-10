import { InvalidSkuError, Sku } from '../value-objects/sku.vo';

export type SkuGeneratorInput = {
  productCode: string;
  color?: string;
  size?: string;
};

export class SkuGenerator {
  generate(input: SkuGeneratorInput): string {
    const productPart = this.normalizeSegment(input.productCode);
    if (!productPart) {
      throw new InvalidSkuError('Product code is required');
    }

    const parts = [productPart];

    const colorPart = this.optionalSegment(input.color);
    if (colorPart) parts.push(colorPart);

    const sizePart = this.optionalSegment(input.size);
    if (sizePart) parts.push(sizePart);

    return parts.join('-');
  }

  generateSku(input: SkuGeneratorInput): Sku {
    return Sku.create(this.generate(input));
  }

  private optionalSegment(raw: string | undefined): string | undefined {
    if (raw === undefined || raw === null) return undefined;
    const normalized = this.normalizeSegment(raw);
    return normalized || undefined;
  }

  private normalizeSegment(raw: string): string {
    return raw
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
