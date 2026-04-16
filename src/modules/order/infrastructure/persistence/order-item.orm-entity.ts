import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItemDocument {
  @Prop({ type: Types.ObjectId, required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  variantId!: Types.ObjectId;

  @Prop({ required: true })
  productName!: string;

  @Prop({
    type: [{ key: { type: String }, value: { type: String } }],
    required: true,
  })
  variantAttributes!: { key: string; value: string }[];

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;

  @Prop({ type: Number, required: true, min: 1 })
  quantity!: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalPrice!: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemDocument);
