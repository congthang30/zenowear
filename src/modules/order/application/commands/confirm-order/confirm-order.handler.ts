import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { ConfirmOrderCommand } from './confirm-order.command';

@Injectable()
export class ConfirmOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order?.id) {
      throw new NotFoundException(`Không tìm thấy đơn: ${command.orderId}`);
    }
    try {
      order.confirmByAdmin();
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }
    await this.orderRepository.save(order);
  }
}
