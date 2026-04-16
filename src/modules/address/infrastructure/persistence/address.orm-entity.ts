import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Addresses', timestamps: true })
export class AddressDocument {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserDocument', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  line1!: string;

  @Prop({ trim: true })
  line2?: string;

  @Prop({ trim: true })
  district?: string;

  @Prop({ required: true, trim: true })
  city!: string;

  @Prop({ default: 'VN', trim: true })
  country?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AddressSchema = SchemaFactory.createForClass(AddressDocument);
