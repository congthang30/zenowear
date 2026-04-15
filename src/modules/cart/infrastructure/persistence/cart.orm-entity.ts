import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CartItemDocument, CartItemSchema } from './cart-item.orm-entity';

@Schema({ collection: 'Carts', timestamps: true })
export class CartDocument {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserDocument',
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items!: CartItemDocument[];
}

export const CartSchema = SchemaFactory.createForClass(CartDocument);
