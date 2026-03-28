import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../../application/dtos/update-profile.dto';
import { UpdateProfileCommand } from '../../application/commands/update-profile/update-profile.command';
import { UpdateProfileHandler } from '../../application/commands/update-profile/update-profile.handler';
import { GetMyProfileQuery } from '../../application/queries/get-my-profile/get-my-profile.query';
import { GetMyProfileHandler } from '../../application/queries/get-my-profile/get-my-profile.handler';

/**
 * Sau này có JWT: lấy userId từ token thay vì @Param — path có thể đổi thành /me/profile.
 * Ví dụ này dùng :userId để gọi thử không cần auth.
 */
@ApiTags('User profile')
@Controller('users')
export class UserProfileController {
  constructor(
    private readonly getMyProfileHandler: GetMyProfileHandler,
    private readonly updateProfileHandler: UpdateProfileHandler,
  ) {}

  @Get(':userId/profile')
  @ApiOperation({
    summary: 'Lấy profile theo userId (ví dụ “my” khi client biết id của mình)',
  })
  async getProfile(@Param('userId') userId: string) {
    const result = await this.getMyProfileHandler.execute(
      new GetMyProfileQuery(userId),
    );
    if (!result) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }
    return result;
  }

  @Patch(':userId/profile')
  @ApiOperation({ summary: 'Cập nhật profile (chỉ user đã tồn tại)' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    await this.updateProfileHandler.execute(
      new UpdateProfileCommand(
        userId,
        body.fullName,
        body.dateOfBirth,
        body.avatar,
      ),
    );
  }
}
