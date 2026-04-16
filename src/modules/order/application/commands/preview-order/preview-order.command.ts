export class PreviewOrderCommand {
  constructor(
    readonly userId: string,
    readonly discountAmount?: number,
    readonly couponCode?: string,
  ) {}
}
