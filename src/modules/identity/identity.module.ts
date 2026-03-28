import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { IDENTITY_REPOSITORY } from './application/identity-repository.token';
import { RegisterHandler } from './application/commands/register/register.handler';
import { AuthController } from './presentation/controllers/auth.controller';
import { IdentityRepositoryImpl } from './infrastructure/persistence/identity.repository.impl';
import {
  IdentityDocument,
  IdentitySchema,
} from './infrastructure/persistence/identity.orm-entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IdentityDocument.name, schema: IdentitySchema },
    ]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    IdentityRepositoryImpl,
    {
      provide: IDENTITY_REPOSITORY,
      useExisting: IdentityRepositoryImpl,
    },
    RegisterHandler,
  ],
  exports: [IdentityRepositoryImpl, MongooseModule],
})
export class IdentityModule {}
