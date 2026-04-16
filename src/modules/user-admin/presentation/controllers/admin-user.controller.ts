import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { AdminChangeEmailDto } from '../../application/dtos/admin-change-email.dto';
import { AdminResetPasswordDto } from '../../application/dtos/admin-reset-password.dto';
import { AdminUpdateUserProfileDto } from '../../application/dtos/admin-update-user-profile.dto';
import { AdminUserQueryDto } from '../../application/dtos/admin-user-query.dto';
import { AdminUpdateUserDto } from '../../application/dtos/admin-update-user.dto';
import {
  AdminUserDetailDto,
  AdminUserListResponseDto,
} from '../../application/dtos/admin-user-response.dto';
import { ListAdminUsersHandler } from '../../application/queries/list-admin-users/list-admin-users.handler';
import { GetAdminUserDetailHandler } from '../../application/queries/get-admin-user-detail/get-admin-user-detail.handler';
import { UpdateAdminUserHandler } from '../../application/commands/update-admin-user/update-admin-user.handler';
import { UpdateAdminUserCommand } from '../../application/commands/update-admin-user/update-admin-user.command';
import { AdminUpdateUserProfileHandler } from '../../application/commands/admin-update-user-profile/admin-update-user-profile.handler';
import { AdminResetUserPasswordHandler } from '../../application/commands/admin-reset-user-password/admin-reset-user-password.handler';
import { AdminChangeUserEmailHandler } from '../../application/commands/admin-change-user-email/admin-change-user-email.handler';

@ApiTags('User (Admin)')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminUserController {
  constructor(
    private readonly listHandler: ListAdminUsersHandler,
    private readonly detailHandler: GetAdminUserDetailHandler,
    private readonly updateHandler: UpdateAdminUserHandler,
    private readonly updateProfileHandler: AdminUpdateUserProfileHandler,
    private readonly resetPasswordHandler: AdminResetUserPasswordHandler,
    private readonly changeEmailHandler: AdminChangeUserEmailHandler,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách user (phân trang, lọc email / role / trạng thái)',
  })
  async list(@Query() query: AdminUserQueryDto): Promise<AdminUserListResponseDto> {
    return this.listHandler.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user theo userId' })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId của bản ghi User' })
  async detail(@Param('id') id: string): Promise<AdminUserDetailDto> {
    return this.detailHandler.execute(id);
  }

  @Patch(':id/profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'CS: cập nhật họ tên và/hoặc ngày sinh cho user (giống quy tắc /users/me)',
  })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId của bản ghi User' })
  @ApiBody({ type: AdminUpdateUserProfileDto })
  async updateProfile(
    @Param('id') id: string,
    @Body() body: AdminUpdateUserProfileDto,
  ): Promise<void> {
    await this.updateProfileHandler.execute(id, body);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Đặt mật khẩu mới (support). Nếu tài khoản LOCKED do sai mật khẩu sẽ mở về ACTIVE; DISABLED không tự bật.',
  })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId của bản ghi User' })
  @ApiBody({ type: AdminResetPasswordDto })
  async resetPassword(
    @Param('id') id: string,
    @Body() body: AdminResetPasswordDto,
  ): Promise<void> {
    await this.resetPasswordHandler.execute(id, body);
  }

  @Patch(':id/email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Đổi email đăng nhập (kiểm tra trùng). Dùng có kiểm soát — gợi ý có quy trình nội bộ / xác minh sau.',
  })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId của bản ghi User' })
  @ApiBody({ type: AdminChangeEmailDto })
  async changeEmail(
    @Param('id') id: string,
    @Body() body: AdminChangeEmailDto,
  ): Promise<void> {
    await this.changeEmailHandler.execute(id, body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cập nhật role và/hoặc trạng thái tài khoản (ACTIVE / LOCKED / DISABLED)',
  })
  @ApiParam({ name: 'id', description: 'Mongo ObjectId của bản ghi User' })
  @ApiBody({ type: AdminUpdateUserDto })
  async update(
    @CurrentUser() actor: JwtAccessPayload,
    @Param('id') id: string,
    @Body() body: AdminUpdateUserDto,
  ): Promise<void> {
    await this.updateHandler.execute(
      new UpdateAdminUserCommand(
        id,
        actor.userId,
        body.role,
        body.accountStatus,
      ),
    );
  }
}
