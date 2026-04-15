export class ChangeCartItemVariantCommand {
  constructor(
    public readonly userId: string,
    public readonly productId: string,
    public readonly fromVariantId: string | undefined,
    public readonly toVariantId: string | undefined,
  ) {}
}
