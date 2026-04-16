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
  findDistinctUserIdsByCouponAndIpHashSince(
    couponId: string,
    ipHash: string,
    since: Date,
    session?: ClientSession,
  ): Promise<string[]>;
  create(
    userId: string,
    couponId: string,
    orderId: string,
    session?: ClientSession,
    ipHash?: string | null,
  ): Promise<string>;
  findByUserId(
    userId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: CouponUsageRow[]; total: number }>;
  deleteByOrderId(orderId: string, session?: ClientSession): Promise<number>;
}
