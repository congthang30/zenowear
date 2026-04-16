import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { CancelOrderCommand } from './cancel-order.command';
import { OrderCheckoutService } from '../../services/order-checkout.service';
import { OrderStatus } from '../../../domain/enum/order-status.enum';
import { CouponConsumptionService } from '../../../../coupon/application/coupon-consumption.service';

@Injectable()
export class CancelOrderHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly checkout: OrderCheckoutService,
    private readonly config: ConfigService,
    private readonly couponConsumption: CouponConsumptionService,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order?.id) {
      throw new NotFoundException(`Không tìm thấy đơn: ${command.orderId}`);
    }
    if (order.userId !== command.userId) {
      throw new ForbiddenException();
    }

    const prev = order.status;
    try {
      order.cancelByUser();
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    if (
      prev === OrderStatus.PENDING ||
      prev === OrderStatus.CONFIRMED
    ) {
      await this.checkout.incrementStocks(order.items);
    }

    const restore =
      this.config.get<boolean>('coupon.restoreOnCancel') === true;
    if (restore && order.appliedCouponId && order.id) {
      await this.couponConsumption.releaseForOrder(
        order.id,
        order.appliedCouponId,
      );
    }

    await this.orderRepository.save(order);
  }
}
