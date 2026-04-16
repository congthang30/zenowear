import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import {
  PaymentMethod,
  isOnlinePaymentMethod,
} from '../../../domain/enum/payment-method.enum';
import { PaymentGatewayRegistry } from '../../../infrastructure/payment/payment-gateway.registry';
import { RetryOnlinePaymentCommand } from './retry-online-payment.command';

@Injectable()
export class RetryOnlinePaymentHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateways: PaymentGatewayRegistry,
  ) {}

  async execute(
    command: RetryOnlinePaymentCommand,
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
        e instanceof Error ? e.message : 'Không thể cập nhật thanh toán',
      );
    }

    const requested = command.paymentMethod;

    if (requested != null && requested !== order.paymentMethod) {
      try {
        order.switchPaymentMethod(requested);
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : 'Không thể đổi phương thức',
        );
      }
    } else if (isOnlinePaymentMethod(order.paymentMethod)) {
      try {
        order.resetOnlinePaymentForRetry();
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : 'Không thể thanh toán lại',
        );
      }
    } else if (
      order.paymentMethod === PaymentMethod.COD &&
      requested === PaymentMethod.COD
    ) {
      throw new BadRequestException(
        'Đơn đã là COD. Để thanh toán online gửi paymentMethod: "MOMO" hoặc "VNPAY" và returnUrl, ví dụ: {"paymentMethod":"MOMO","returnUrl":"https://..."}',
      );
    } else {
      throw new BadRequestException(
        'Đơn đang COD: body cần có paymentMethod là "MOMO" hoặc "VNPAY" (và returnUrl) để chuyển sang thanh toán online. Hoặc PATCH /api/v1/orders/:id/payment-method với cùng nội dung.',
      );
    }

    if (isOnlinePaymentMethod(order.paymentMethod)) {
      if (!command.returnUrl?.trim()) {
        throw new BadRequestException(
          'Cần returnUrl khi thanh toán MOMO/VNPAY',
        );
      }
    }

    await this.orderRepository.save(order);

    if (!isOnlinePaymentMethod(order.paymentMethod)) {
      return {};
    }

    const strategy = this.paymentGateways.get(order.paymentMethod);
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
