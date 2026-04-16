import type { ClientSession } from 'mongoose';
import type { CouponType } from '../enum/coupon-type.enum';
import type { CouponStatus } from '../enum/coupon-status.enum';

export type CouponReadModel = {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null | undefined;
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  usageLimit: number | null | undefined;
  usagePerUser: number;
  usedCount: number;
};

export type CreateCouponInput = {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  usageLimit?: number | null;
  usagePerUser: number;
};

export type UpdateCouponInput = Partial<
  Omit<CreateCouponInput, 'code'> & { code?: string }
>;

export interface ICouponRepository {
  create(input: CreateCouponInput): Promise<string>;
  update(id: string, patch: UpdateCouponInput): Promise<void>;
  findById(id: string): Promise<CouponReadModel | null>;
  findByCode(code: string): Promise<CouponReadModel | null>;
  findAll(page: number, limit: number): Promise<{ data: CouponReadModel[]; total: number }>;
  setStatus(id: string, status: CouponStatus): Promise<void>;
  incrementUsedCount(id: string, session?: ClientSession): Promise<void>;
  decrementUsedCount(id: string, session?: ClientSession): Promise<void>;
}
