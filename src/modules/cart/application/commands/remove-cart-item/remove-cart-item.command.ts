export class RemoveCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly variantId: string | undefined,
  ) {}
}
