import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OrderStatus } from '../../domain/enum/order-status.enum';
import { PaymentMethod } from '../../domain/enum/payment-method.enum';
import { PaymentStatus } from '../../domain/enum/payment-status.enum';
import { OrderItemDocument, OrderItemSchema } from './order-item.orm-entity';
import {
  OrderShippingAddressDocument,
  OrderShippingAddressSchema,
} from './order-shipping-address.orm-entity';

@Schema({ collection: 'Orders', timestamps: { createdAt: true, updatedAt: true } })
export class OrderDocument {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItemDocument[];

  @Prop({ type: Number, required: true, min: 0 })
  totalAmount!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  discountAmount!: number;

  @Prop({ type: Number, required: true, min: 0 })
  finalAmount!: number;

  @Prop({ type: String, enum: OrderStatus, required: true, index: true })
  status!: OrderStatus;

  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod!: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, required: true, index: true })
  paymentStatus!: PaymentStatus;

  @Prop({ type: OrderShippingAddressSchema, required: true })
  shippingAddress!: OrderShippingAddressDocument;

  @Prop({ type: String })
  paymentProviderReference?: string;

  @Prop({ type: Types.ObjectId, ref: 'CouponDocument', default: null })
  appliedCouponId?: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  appliedCouponCode?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);

OrderSchema.index(
  { paymentProviderReference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentProviderReference: { $exists: true, $type: 'string', $gt: '' },
    },
  },
);
