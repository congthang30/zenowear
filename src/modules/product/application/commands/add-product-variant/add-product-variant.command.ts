export class AddProductVariantCommand {
  constructor(
    readonly productId: string,
    readonly sku: string,
    readonly attributes: Array<{ key: string; value: string }>,
    readonly originalPrice: number,
    readonly price: number,
    readonly stock: number,
    readonly isDefault: boolean,
    readonly images?: string[],
  ) {}
}
