import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'product_variants', timestamps: true })
export class ProductVariantDocument {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  sku!: string;

  @Prop({ type: Map, of: String })
  attributes?: Record<string, string>;

  @Prop({ type: Number, required: true, min: 0 })
  price!: number;

  @Prop({ type: Number, default: 0, min: 0 })
  stock!: number;

  // discount riêng variant
  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  discountPercent?: number;

  @Prop([String])
  images?: string[];
}

export const ProductVariantSchema = SchemaFactory.createForClass(
  ProductVariantDocument,
);

// index query nhanh
ProductVariantSchema.index({ productId: 1 });

// tránh trùng variant (size + color)
ProductVariantSchema.index(
  {
    productId: 1,
    'attributes.size': 1,
    'attributes.color': 1,
  },
  {
    unique: true,
    sparse: true,
  },
);
