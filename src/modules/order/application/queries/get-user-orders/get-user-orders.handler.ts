import { Inject, Injectable } from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { GetUserOrdersQuery } from './get-user-orders.query';
import {
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from '../../dtos/order-response.dto';
import { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class GetUserOrdersHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(query: GetUserOrdersQuery): Promise<PaginatedOrdersResponseDto> {
    const skip = (query.page - 1) * query.limit;
    const { data, total } = await this.orderRepository.findByUserId(
      query.userId,
      skip,
      query.limit,
    );
    return {
      data: data.map((o) => this.toDto(o)),
      total,
    };
  }

  private toDto(order: Order): OrderResponseDto {
    return {
      id: order.id!,
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
