import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class CartItemDocument {
  @Prop({ type: Types.ObjectId, ref: 'ProductDocument', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariantDocument' })
  variantId?: Types.ObjectId;

  @Prop({ type: Number, required: true, min: 1 })
  quantity!: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItemDocument);
