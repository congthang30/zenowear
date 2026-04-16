import type { ClientSession } from 'mongoose';

export type CouponUsageRow = {
  id: string;
  userId: string;
  couponId: string;
  orderId: string;
  usedAt: Date;
};

export interface ICouponUsageRepository {
  countByUserAndCoupon(
    userId: string,
    couponId: string,
    session?: ClientSession,
  ): Promise<number>;
  create(
    userId: string,
    couponId: string,
    orderId: string,
    session?: ClientSession,
  ): Promise<string>;
  findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: CouponUsageRow[]; total: number }>;
  deleteByOrderId(orderId: string, session?: ClientSession): Promise<number>;
}
