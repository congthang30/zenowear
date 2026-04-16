import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../../domain/entities/order.entity';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { OrderDocument } from './order.orm-entity';
import { OrderMapper } from './order.mapper';
@Injectable()
export class OrderRepositoryImpl implements IOrderRepository {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(order: Order): Promise<string> {
    const p = OrderMapper.toPersistence(order);
    const row: Parameters<typeof this.orderModel.create>[0] = {
      userId: new Types.ObjectId(p.userId),
      items: p.items.map((i) => ({
        productId: new Types.ObjectId(i.productId),
        variantId: new Types.ObjectId(i.variantId),
        productName: i.productName,
        variantAttributes: i.variantAttributes,
        price: i.price,
        quantity: i.quantity,
        totalPrice: i.totalPrice,
      })),
      totalAmount: p.totalAmount,
      discountAmount: p.discountAmount,
      finalAmount: p.finalAmount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      shippingAddress: p.shippingAddress,
    };
    if (p.paymentProviderReference) {
      row.paymentProviderReference = p.paymentProviderReference;
    }
    if (p.appliedCouponId) {
      row.appliedCouponId = new Types.ObjectId(p.appliedCouponId);
      row.appliedCouponCode = p.appliedCouponCode ?? undefined;
    }
    const doc = await this.orderModel.create(row);
    return doc._id.toString();
  }

  async deleteById(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.orderModel.deleteOne({ _id: new Types.ObjectId(id) });
  }

  async save(order: Order): Promise<void> {
    if (!order.id || !Types.ObjectId.isValid(order.id)) {
      throw new Error('Order id required');
    }
    const p = OrderMapper.toPersistence(order);
    const oid = new Types.ObjectId(order.id);
    const baseSet: Record<string, unknown> = {
      status: p.status,
      paymentStatus: p.paymentStatus,
      paymentMethod: p.paymentMethod,
    };
    if (p.appliedCouponId) {
      baseSet.appliedCouponId = new Types.ObjectId(p.appliedCouponId);
      baseSet.appliedCouponCode = p.appliedCouponCode ?? null;
    }
    const unsetLegacy: Record<string, ''> = { onlinePaymentGateway: '' };
    if (p.paymentProviderReference) {
      await this.orderModel.updateOne(
        { _id: oid },
        {
          $set: {
            ...baseSet,
            paymentProviderReference: p.paymentProviderReference,
          },
          $unset: unsetLegacy,
        },
      );
    } else {
      await this.orderModel.updateOne(
        { _id: oid },
        {
          $set: baseSet,
          $unset: { ...unsetLegacy, paymentProviderReference: '' },
        },
      );
    }
  }

  async findById(id: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.orderModel.findById(id).lean();
    if (!doc) return null;
    return OrderMapper.toDomain(doc as unknown as OrderDocument);
  }

  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Order[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { data: [], total: 0 };
    }
    const uid = new Types.ObjectId(userId);
    const [docs, total] = await Promise.all([
      this.orderModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments({ userId: uid }),
    ]);
    return {
      data: docs.map((d) =>
        OrderMapper.toDomain(d as unknown as OrderDocument),
      ),
      total,
    };
  }

  async findByPaymentReference(reference: string): Promise<Order | null> {
    if (!reference) return null;
    const doc = await this.orderModel
      .findOne({ paymentProviderReference: reference })
      .lean();
    if (!doc) return null;
    return OrderMapper.toDomain(doc as unknown as OrderDocument);
  }
}
