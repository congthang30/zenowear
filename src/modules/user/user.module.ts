import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { UpdateProfileHandler } from './application/commands/update-profile/update-profile.handler';
import { GetMyProfileHandler } from './application/queries/get-my-profile/get-my-profile.handler';
import { USER_REPOSITORY } from './application/user-repository.token';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import {
  UserDocument,
  UserSchema,
} from './infrastructure/persistence/user.orm-entity';
import { UserProfileController } from './presentation/controllers/user-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    AuthJwtModule,
  ],
  controllers: [UserProfileController],
  providers: [
    UserRepositoryImpl,
    {
      provide: USER_REPOSITORY,
      useExisting: UserRepositoryImpl,
    },
    UpdateProfileHandler,
    GetMyProfileHandler,
  ],
  exports: [
    MongooseModule,
    UserRepositoryImpl,
    { provide: USER_REPOSITORY, useExisting: UserRepositoryImpl },
  ],
})
export class UserModule {}
