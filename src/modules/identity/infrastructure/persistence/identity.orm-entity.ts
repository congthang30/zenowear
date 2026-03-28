import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AccountStatus } from '../../domain/enum/account-status.enum';
import { RoleAccount } from '../../domain/enum/role.enum';

@Schema({ collection: 'Identity', timestamps: true })
export class IdentityDocument {
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Prop({ default: 0 })
  failedLoginCount: number;

  @Prop()
  lockedAt?: Date;

  @Prop({
    type: String,
    enum: RoleAccount,
    default: RoleAccount.CUSTOMER,
  })
  role: RoleAccount;
}

export const IdentitySchema = SchemaFactory.createForClass(IdentityDocument);
