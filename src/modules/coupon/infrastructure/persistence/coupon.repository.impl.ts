import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClientSession } from 'mongoose';
import { Model, Types } from 'mongoose';
import {
  type CouponReadModel,
  type CreateCouponInput,
  type ICouponRepository,
  type UpdateCouponInput,
} from '../../domain/repositories/coupon.repository.interface';
import { CouponDocument } from './coupon.orm-entity';
import { CouponStatus } from '../../domain/enum/coupon-status.enum';

function toRead(doc: CouponDocument): CouponReadModel {
  return {
    id: doc._id.toString(),
    code: doc.code,
    name: doc.name,
    description: doc.description ?? '',
    type: doc.type,
    value: doc.value,
    minOrderAmount: doc.minOrderAmount ?? 0,
    maxDiscountAmount: doc.maxDiscountAmount ?? null,
    startDate: doc.startDate,
    endDate: doc.endDate,
    status: doc.status,
    usageLimit: doc.usageLimit ?? null,
    usagePerUser: doc.usagePerUser ?? 1,
    usedCount: doc.usedCount ?? 0,
  };
}

@Injectable()
export class CouponRepositoryImpl implements ICouponRepository {
  constructor(
    @InjectModel(CouponDocument.name)
    private readonly model: Model<CouponDocument>,
  ) {}

  async create(input: CreateCouponInput): Promise<string> {
    const doc = await this.model.create({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      type: input.type,
      value: input.value,
      minOrderAmount: input.minOrderAmount,
      maxDiscountAmount: input.maxDiscountAmount ?? null,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      usageLimit: input.usageLimit ?? null,
      usagePerUser: input.usagePerUser,
      usedCount: 0,
    });
    return doc._id.toString();
  }

  async update(id: string, patch: UpdateCouponInput): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    const $set: Record<string, unknown> = {};
    if (patch.code !== undefined) $set.code = patch.code.trim().toUpperCase();
    if (patch.name !== undefined) $set.name = patch.name.trim();
    if (patch.description !== undefined) $set.description = patch.description.trim();
    if (patch.type !== undefined) $set.type = patch.type;
    if (patch.value !== undefined) $set.value = patch.value;
    if (patch.minOrderAmount !== undefined) $set.minOrderAmount = patch.minOrderAmount;
    if (patch.maxDiscountAmount !== undefined)
      $set.maxDiscountAmount = patch.maxDiscountAmount;
    if (patch.startDate !== undefined) $set.startDate = patch.startDate;
    if (patch.endDate !== undefined) $set.endDate = patch.endDate;
    if (patch.status !== undefined) $set.status = patch.status;
    if (patch.usageLimit !== undefined) $set.usageLimit = patch.usageLimit;
    if (patch.usagePerUser !== undefined) $set.usagePerUser = patch.usagePerUser;
    if (Object.keys($set).length === 0) return;
    await this.model.updateOne({ _id: new Types.ObjectId(id) }, { $set });
  }

  async findById(id: string): Promise<CouponReadModel | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean();
    if (!doc) return null;
    return toRead(doc as CouponDocument);
  }

  async findByCode(code: string): Promise<CouponReadModel | null> {
    const c = code.trim().toUpperCase();
    if (!c) return null;
    const doc = await this.model.findOne({ code: c }).lean();
    if (!doc) return null;
    return toRead(doc as CouponDocument);
  }

  async findAll(page: number, limit: number): Promise<{ data: CouponReadModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.model.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(),
    ]);

    return {
      data: docs.map(doc => toRead(doc as CouponDocument)),
      total,
    };
  }

  async setStatus(id: string, status: CouponStatus): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.model.updateOne({ _id: new Types.ObjectId(id) }, { $set: { status } });
  }

  async incrementUsedCount(id: string, session?: ClientSession): Promise<void> {
    if (!Types.ObjectId.isValid(id)) throw new Error('Invalid coupon id');
    const now = new Date();
    const oid = new Types.ObjectId(id);
    const res = await this.model.findOneAndUpdate(
      {
        _id: oid,
        status: CouponStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
          { usageLimit: null },
          { usageLimit: { $exists: false } },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
        ],
      },
      { $inc: { usedCount: 1 } },
      { new: true, session },
    );
    if (!res) {
      const err = new Error('COUPON_NO_QUOTA');
      err.name = 'COUPON_NO_QUOTA';
      throw err;
    }
  }

  async decrementUsedCount(id: string, session?: ClientSession): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.model.updateOne(
      { _id: new Types.ObjectId(id), usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } },
      { session },
    );
  }
}
