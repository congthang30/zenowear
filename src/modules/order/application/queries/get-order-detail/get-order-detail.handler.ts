import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { GetOrderDetailQuery } from './get-order-detail.query';
import { OrderResponseDto } from '../../dtos/order-response.dto';
import { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class GetOrderDetailHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetOrderDetailQuery): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(query.orderId);
    if (!order?.id) {
      throw new NotFoundException(`Không tìm thấy đơn: ${query.orderId}`);
    }
    if (!query.isAdmin && order.userId !== query.userId) {
      throw new ForbiddenException();
    }
    return this.toDto(order);
  }

  private toDto(order: Order): OrderResponseDto {
    if (!order.id) throw new NotFoundException();
    return {
      id: order.id,
      userId: order.userId,
      items: order.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantAttributes: i.variantAttributes,
        price: i.price,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      finalAmount: order.finalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: { ...order.shippingAddress },
      paymentProviderReference: order.paymentProviderReference ?? null,
      appliedCouponId: order.appliedCouponId ?? null,
      appliedCouponCode: order.appliedCouponCode ?? null,
      createdAt: order.createdAt?.toISOString(),
    };
  }
}
