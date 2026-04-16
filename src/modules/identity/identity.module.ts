import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { UserModule } from '../user/user.module';
import {
  IDENTITY_REPOSITORY,
} from './application/identity-repository.token';
import { RegisterHandler } from './application/commands/register/register.handler';
import { AuthController } from './presentation/controllers/auth.controller';
import { IdentityRepositoryImpl } from './infrastructure/persistence/identity.repository.impl';
import {
  IdentityDocument,
  IdentitySchema,
} from './infrastructure/persistence/identity.orm-entity';
import { LoginHandler } from './application/commands/login/login.handler';
import { ChangeMyPasswordHandler } from './application/commands/change-my-password/change-my-password.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IdentityDocument.name, schema: IdentitySchema },
    ]),
    AuthJwtModule,
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
    LoginHandler,
    ChangeMyPasswordHandler,
  ],
  exports: [
    IdentityRepositoryImpl,
    MongooseModule,
    { provide: IDENTITY_REPOSITORY, useExisting: IdentityRepositoryImpl },
  ],
})
export class IdentityModule {}
