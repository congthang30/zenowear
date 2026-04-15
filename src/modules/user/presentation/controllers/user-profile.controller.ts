import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';
import { CloudinaryService } from '../../../../common/cloudinary/cloudinary.service';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
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
    private readonly cloudinary: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  @Get('me')
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

  @Patch('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Đổi ảnh đại diện (JWT): upload file lên Cloudinary, cập nhật URL profile',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
        if (!ok) {
          cb(
            new BadRequestException(
              'Ảnh đại diện chỉ chấp nhận JPEG, PNG hoặc WebP',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async updateMyAvatar(
    @CurrentUser() user: JwtAccessPayload,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!avatar?.buffer?.length) {
      throw new BadRequestException('Thiếu file ảnh (field name: avatar)');
    }
    const baseFolder =
      this.config.get<string>('cloudinary.uploadFolder') ?? 'zenowear';
    const uploaded = await this.cloudinary.uploadImageBuffer(avatar.buffer, {
      folder: `${baseFolder}/avatars`,
    });

    await this.updateProfileHandler.execute(
      new UpdateProfileCommand(user.userId, undefined, undefined, uploaded.url),
    );

    const updated = await this.getMyProfileHandler.execute(
      new GetMyProfileQuery(user.userId),
    );
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy user: ${user.userId}`);
    }
    return updated;
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  @ApiOperation({
    summary: 'Cập nhật profile (JWT): fullName và/hoặc dateOfBirth (JSON, không upload ảnh)',
  })
  @ApiBody({ type: UpdateProfileDto })
  async updateMyProfile(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const hasFullName =
      typeof body.fullName === 'string' && body.fullName.trim().length > 0;
    const hasDob = body.dateOfBirth instanceof Date && !Number.isNaN(body.dateOfBirth.getTime());

    if (!hasFullName && !hasDob) {
      throw new BadRequestException(
        'Gửi ít nhất fullName hoặc dateOfBirth hợp lệ',
      );
    }

    await this.updateProfileHandler.execute(
      new UpdateProfileCommand(
        user.userId,
        hasFullName ? body.fullName!.trim() : undefined,
        hasDob ? body.dateOfBirth : undefined,
        undefined,
      ),
    );

    const updated = await this.getMyProfileHandler.execute(
      new GetMyProfileQuery(user.userId),
    );
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy user: ${user.userId}`);
    }
    return updated;
  }
}
