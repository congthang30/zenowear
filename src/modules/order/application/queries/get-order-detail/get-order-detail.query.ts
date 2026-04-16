export class GetOrderDetailQuery {
  constructor(
    readonly orderId: string,
    readonly userId: string,
    readonly isAdmin: boolean,
  ) {}
}
