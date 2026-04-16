import { Module } from '@nestjs/common';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { IdentityModule } from '../identity/identity.module';
import { UserModule } from '../user/user.module';
import { ListAdminUsersHandler } from './application/queries/list-admin-users/list-admin-users.handler';
import { GetAdminUserDetailHandler } from './application/queries/get-admin-user-detail/get-admin-user-detail.handler';
import { UpdateAdminUserHandler } from './application/commands/update-admin-user/update-admin-user.handler';
import { AdminUpdateUserProfileHandler } from './application/commands/admin-update-user-profile/admin-update-user-profile.handler';
import { AdminResetUserPasswordHandler } from './application/commands/admin-reset-user-password/admin-reset-user-password.handler';
import { AdminChangeUserEmailHandler } from './application/commands/admin-change-user-email/admin-change-user-email.handler';
import { AdminUserController } from './presentation/controllers/admin-user.controller';

@Module({
  imports: [AuthJwtModule, UserModule, IdentityModule],
  controllers: [AdminUserController],
  providers: [
    ListAdminUsersHandler,
    GetAdminUserDetailHandler,
    UpdateAdminUserHandler,
    AdminUpdateUserProfileHandler,
    AdminResetUserPasswordHandler,
    AdminChangeUserEmailHandler,
  ],
})
export class UserAdminModule {}
