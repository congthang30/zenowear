export class AddCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly variantId: string | undefined,
    public readonly quantity: number,
  ) {}
}
