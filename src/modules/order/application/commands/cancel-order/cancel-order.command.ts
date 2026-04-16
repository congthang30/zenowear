export class CancelOrderCommand {
  constructor(
    readonly userId: string,
    readonly orderId: string,
  ) {}
}
