import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CouponType } from '../../domain/enum/coupon-type.enum';
import { CouponStatus } from '../../domain/enum/coupon-status.enum';

@Schema({ collection: 'Coupons', timestamps: true })
export class CouponDocument {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true, default: '' })
  description!: string;

  @Prop({ type: String, enum: CouponType, required: true })
  type!: CouponType;

  @Prop({ type: Number, required: true, min: 0 })
  value!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  minOrderAmount!: number;

  @Prop({ type: Number, min: 0, default: null })
  maxDiscountAmount?: number | null;

  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop({ type: String, enum: CouponStatus, required: true, index: true })
  status!: CouponStatus;

  /** null = không giới hạn tổng hệ thống */
  @Prop({ type: Number, min: 1, default: null })
  usageLimit?: number | null;

  @Prop({ type: Number, required: true, min: 1, default: 1 })
  usagePerUser!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  usedCount!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(CouponDocument);
