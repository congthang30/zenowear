import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClientSession } from 'mongoose';
import { Model, Types } from 'mongoose';
import type {
  CouponUsageRow,
  ICouponUsageRepository,
} from '../../domain/repositories/coupon-usage.repository.interface';
import { CouponUsageDocument } from './coupon-usage.orm-entity';

@Injectable()
export class CouponUsageRepositoryImpl implements ICouponUsageRepository {
  constructor(
    @InjectModel(CouponUsageDocument.name)
    private readonly model: Model<CouponUsageDocument>,
  ) {}

  async countByUserAndCoupon(
    userId: string,
    couponId: string,
    session?: ClientSession,
  ): Promise<number> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(couponId)) {
      return 0;
    }
    return this.model.countDocuments(
      {
        userId: new Types.ObjectId(userId),
        couponId: new Types.ObjectId(couponId),
      },
      { session },
    );
  }

  async create(
    userId: string,
    couponId: string,
    orderId: string,
    session?: ClientSession,
  ): Promise<string> {
    const usedAt = new Date();
    const [doc] = await this.model.create(
      [
        {
          userId: new Types.ObjectId(userId),
          couponId: new Types.ObjectId(couponId),
          orderId: new Types.ObjectId(orderId),
          usedAt,
        },
      ],
      { session },
    );
    return doc._id.toString();
  }

  async findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: CouponUsageRow[]; total: number }> {
    if (!Types.ObjectId.isValid(userId)) {
      return { data: [], total: 0 };
    }
    const uid = new Types.ObjectId(userId);
    const [docs, total] = await Promise.all([
      this.model
        .find({ userId: uid })
        .sort({ usedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments({ userId: uid }),
    ]);
    return {
      data: docs.map((d) => ({
        id: d._id.toString(),
        userId: d.userId.toString(),
        couponId: d.couponId.toString(),
        orderId: d.orderId.toString(),
        usedAt: d.usedAt,
      })),
      total,
    };
  }

  async deleteByOrderId(orderId: string, session?: ClientSession): Promise<number> {
    if (!Types.ObjectId.isValid(orderId)) return 0;
    const res = await this.model.deleteMany(
      { orderId: new Types.ObjectId(orderId) },
      { session },
    );
    return res.deletedCount ?? 0;
  }
}
