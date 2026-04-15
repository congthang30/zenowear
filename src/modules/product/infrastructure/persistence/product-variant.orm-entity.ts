import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  collection: 'Product_Variants',
  timestamps: true,
})
export class ProductVariantDocument {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  sku!: string;

  @Prop({
    type: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    required: true,
    validate: {
      validator: (val: any[]) => val.length > 0,
      message: 'Variant must have at least one attribute',
    },
  })
  attributes!: { key: string; value: string }[];

  @Prop({ type: Number, required: true, min: 0 })
  originalPrice!: number;

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  stock!: number;

  // UI
  @Prop({ type: Boolean, default: false })
  isDefault!: boolean;

  @Prop([String])
  images?: string[];
}

export const ProductVariantSchema = SchemaFactory.createForClass(
  ProductVariantDocument,
);

