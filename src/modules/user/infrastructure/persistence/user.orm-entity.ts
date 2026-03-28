import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'User', timestamps: true })
export class UserDocument {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop()
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
