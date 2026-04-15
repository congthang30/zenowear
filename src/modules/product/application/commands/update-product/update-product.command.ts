export class UpdateProductCommand {
  constructor(
    readonly id: string,
    readonly productName?: string,
    readonly slug?: string,
    readonly barcode?: string,
    readonly description?: string,
    readonly tags?: string[],
    readonly brandId?: string,
    readonly categoryId?: string,
    readonly images?: string[],
    readonly videoUrl?: string | null,
  ) {}
}
