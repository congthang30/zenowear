import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

@Schema({ collection: 'Brand', timestamps: true })
export class BrandDocument {
  _id: Types.ObjectId;

  @Prop({ required: true })
  brandName: string;

  @Prop({
    type: String,
    enum: BrandStatus,
    default: BrandStatus.ACTIVE,
    required: true,
  })
  brandStatus: BrandStatus;
}

export const BrandSchema = SchemaFactory.createForClass(BrandDocument);
