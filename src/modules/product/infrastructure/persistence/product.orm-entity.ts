import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ProductStatus } from '../../domain/enum/productStatus.enum';

@Schema({
  collection: 'Products',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ProductDocument {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  productName!: string;

  @Prop({ unique: true, sparse: true, index: true })
  slug?: string;

  @Prop({ unique: true, sparse: true })
  barcode!: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @Prop({ type: Boolean, default: false })
  isFeatured?: boolean;

  @Prop([String])
  images?: string[];

  @Prop()
  videoUrl?: string;

  @Prop({ type: Number, default: 0, index: true })
  viewCount!: number;

  @Prop({ type: Number, default: 0, index: true })
  totalSold!: number;

  @Prop({ type: Number, default: 0 })
  ratingAverage!: number;

  @Prop({ type: Number, default: 0 })
  reviewCount!: number;

  @Prop({ type: Number, default: 0 })
  ratingTotal!: number;

  @Prop([String])
  tags?: string[];

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brandId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId!: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);

ProductSchema.index({
  productName: 'text',
  description: 'text',
  tags: 'text',
});

ProductSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId',
});
