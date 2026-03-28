import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
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
import { LoginHandler } from './application/commands/login/login.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IdentityDocument.name, schema: IdentitySchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: (config.get<string>('jwt.expiresIn') ??
            '7d') as SignOptions['expiresIn'],
        },
      }),
    }),
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
  ],
  exports: [IdentityRepositoryImpl, MongooseModule],
})
export class IdentityModule {}
