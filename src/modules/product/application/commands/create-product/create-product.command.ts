export class CreateProductCommand {
  constructor(
    public readonly productName: string,
    public readonly barcode: string,
    public readonly description: string | undefined,
    public readonly brandId: string,
    public readonly categoryId: string,
    public readonly variants: Array<{
      sku: string;
      attributes: Array<{ key: string; value: string }>;
      originalPrice: number;
      price: number;
      stock: number;
      isDefault: boolean;
      images?: string[];
    }>,
    public readonly images?: string[],
    public readonly videoUrl?: string,
  ) {}
}
