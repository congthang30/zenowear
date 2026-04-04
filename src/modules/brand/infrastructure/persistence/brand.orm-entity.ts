import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

@Schema({ collection: 'Category', timestamps: true })
export class CategoryDocument {
  _id: Types.ObjectId;

  @Prop({ required: true })
  categoryName: string;

  @Prop({
    type: String,
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
    required: true,
  })
  categoryStatus: BrandStatus;
}
