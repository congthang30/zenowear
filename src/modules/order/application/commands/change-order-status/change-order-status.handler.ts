import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { ChangeOrderStatusCommand } from './change-order-status.command';

@Injectable()
export class ChangeOrderStatusHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(command: ChangeOrderStatusCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order?.id) {
      throw new NotFoundException(`Không tìm thấy đơn: ${command.orderId}`);
    }
    try {
      order.applyAdminStatus(command.status);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }
    await this.orderRepository.save(order);
  }
}
