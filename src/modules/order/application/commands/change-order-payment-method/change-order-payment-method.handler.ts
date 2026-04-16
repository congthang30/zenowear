import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { isOnlinePaymentMethod } from '../../../domain/enum/payment-method.enum';
import { PaymentGatewayRegistry } from '../../../infrastructure/payment/payment-gateway.registry';
import { ChangeOrderPaymentMethodCommand } from './change-order-payment-method.command';

@Injectable()
export class ChangeOrderPaymentMethodHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateways: PaymentGatewayRegistry,
  ) {}

  async execute(
    command: ChangeOrderPaymentMethodCommand,
  ): Promise<{ paymentRedirectUrl?: string }> {
    const order = await this.orderRepository.findById(command.orderId);
    if (!order?.id) {
      throw new NotFoundException('Không tìm thấy đơn');
    }
    if (order.userId !== command.userId) {
      throw new ForbiddenException('Không phải đơn của bạn');
    }

    try {
      order.assertPaymentAdjustable();
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Không thể đổi phương thức',
      );
    }

    if (isOnlinePaymentMethod(command.paymentMethod)) {
      if (!command.returnUrl) {
        throw new BadRequestException(
          'Chuyển sang MOMO/VNPAY cần returnUrl',
        );
      }
    }

    if (order.paymentMethod === command.paymentMethod) {
      throw new BadRequestException('Đơn đã dùng phương thức này');
    }

    try {
      order.switchPaymentMethod(command.paymentMethod);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : 'Không thể đổi phương thức',
      );
    }

    await this.orderRepository.save(order);

    if (!isOnlinePaymentMethod(command.paymentMethod)) {
      return {};
    }

    const strategy = this.paymentGateways.get(command.paymentMethod);
    const { redirectUrl } = await strategy.buildPaymentUrl({
      orderId: order.id,
      amount: order.finalAmount,
      orderDescription: `Thanh toan don hang ${order.id}`,
      returnUrl: command.returnUrl!,
      ipnUrl: command.ipnUrl,
      clientIp: command.clientIp,
    });

    return { paymentRedirectUrl: redirectUrl };
  }
}
