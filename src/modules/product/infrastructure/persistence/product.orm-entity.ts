import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Product', timestamps: true })
export class ProductDocument {
  _id: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  quantity: string;

  @Prop({ required: true })
  isFeatured: string;
}
