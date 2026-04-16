import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'CouponUsages', timestamps: { createdAt: false, updatedAt: false } })
export class CouponUsageDocument {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserDocument', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CouponDocument', required: true, index: true })
  couponId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'OrderDocument', required: true, index: true })
  orderId!: Types.ObjectId;

  @Prop({ type: Date, required: true, default: () => new Date() })
  usedAt!: Date;
}

export const CouponUsageSchema = SchemaFactory.createForClass(CouponUsageDocument);

CouponUsageSchema.index({ userId: 1, couponId: 1, orderId: 1 }, { unique: true });
CouponUsageSchema.index({ userId: 1, usedAt: -1 });
