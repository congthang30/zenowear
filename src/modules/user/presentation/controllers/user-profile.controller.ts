import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtAccessPayload } from 'src/common/strategies/jwt.strategy';
import { UpdateUserDto } from '../../application/dtos/update-profile.dto';
import { UpdateProfileCommand } from '../../application/commands/update-profile/update-profile.command';
import { UpdateProfileHandler } from '../../application/commands/update-profile/update-profile.handler';
import { GetMyProfileHandler } from '../../application/queries/get-my-profile/get-my-profile.handler';
import { GetMyProfileQuery } from '../../application/queries/get-my-profile/get-my-profile.query';
import { UserResponseDto } from '../../application/dtos/user-profile-response.dto';

@ApiTags('User profile')
@Controller('users')
export class UserProfileController {
  constructor(
    private readonly getMyProfileHandler: GetMyProfileHandler,
    private readonly updateProfileHandler: UpdateProfileHandler,
  ) {}

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy profile của user đang đăng nhập (JWT)' })
  async getMyProfile(
    @CurrentUser() user: JwtAccessPayload,
  ): Promise<UserResponseDto> {
    const result: UserResponseDto | null =
      await this.getMyProfileHandler.execute(
        new GetMyProfileQuery(user.userId),
      );
    if (!result) {
      throw new NotFoundException(`Không tìm thấy user: ${user.userId}`);
    }
    return result;
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật profile của user đang đăng nhập (JWT)' })
  async updateMyProfile(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: UpdateUserDto,
  ) {
    await this.updateProfileHandler.execute(
      new UpdateProfileCommand(
        user.userId,
        body.fullName,
        body.dateOfBirth,
        body.avatar,
      ),
    );
  }
}
