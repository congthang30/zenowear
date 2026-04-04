import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

@Schema({ collection: 'Category', timestamps: true })
export class CategoryDocument {
  _id: Types.ObjectId;

  @Prop({ required: true })
  categoryName: string;

  @Prop({
    type: String,
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    required: true,
  })
  categoryStatus: CategoryStatus;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryDocument);
