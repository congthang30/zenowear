export class DeleteProductVariantCommand {
  constructor(
    readonly productId: string,
    readonly variantId: string,
  ) {}
}
