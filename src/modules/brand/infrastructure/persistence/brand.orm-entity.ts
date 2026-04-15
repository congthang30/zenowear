import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

@Schema({ collection: 'Brand', timestamps: true })
export class BrandDocument {
  _id!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  brandName: string;

  @Prop({ type: String, default: null })
  logo: string | null;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({
    type: String,
    enum: BrandStatus,
    default: BrandStatus.DRAFT,
    required: true,
  })
  brandStatus: BrandStatus;
}

export const BrandSchema = SchemaFactory.createForClass(BrandDocument);
