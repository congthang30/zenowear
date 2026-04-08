import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductStatus } from '../../domain/enum/productStatus.enum';

@Schema({ collection: 'products', timestamps: true })
export class ProductDocument {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  productName!: string;

  @Prop({ unique: true, sparse: true })
  barcode?: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  discountPercent?: number;

  @Prop({ type: Boolean, default: false })
  isFeatured?: boolean;

  @Prop()
  image?: string;

  @Prop({ type: Number, default: 0, index: true })
  viewCount?: number;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brandId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId!: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);

// virtual để lấy variants
ProductSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId',
});
