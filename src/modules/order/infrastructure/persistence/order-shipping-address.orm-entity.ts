import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class OrderShippingAddressDocument {
  @Prop({ required: true }) fullName!: string;
  @Prop({ required: true }) phone!: string;
  @Prop({ required: true }) line1!: string;
  @Prop() line2?: string;
  @Prop() district?: string;
  @Prop({ required: true }) city!: string;
  @Prop({ default: 'VN' }) country?: string;
}

export const OrderShippingAddressSchema = SchemaFactory.createForClass(
  OrderShippingAddressDocument,
);
