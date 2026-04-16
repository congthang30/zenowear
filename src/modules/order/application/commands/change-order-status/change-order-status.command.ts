import { OrderStatus } from '../../../domain/enum/order-status.enum';

export class ChangeOrderStatusCommand {
  constructor(
    readonly orderId: string,
    readonly status: OrderStatus,
  ) {}
}
