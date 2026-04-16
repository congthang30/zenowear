import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UpdateProfileCommand } from '../../../../user/application/commands/update-profile/update-profile.command';
import { UpdateProfileHandler } from '../../../../user/application/commands/update-profile/update-profile.handler';
import type { AdminUpdateUserProfileDto } from '../../dtos/admin-update-user-profile.dto';

@Injectable()
export class AdminUpdateUserProfileHandler {
  constructor(private readonly updateProfileHandler: UpdateProfileHandler) {}

  async execute(
    userId: string,
    body: AdminUpdateUserProfileDto,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const hasFullName =
      typeof body.fullName === 'string' && body.fullName.trim().length > 0;
    const hasDob =
      body.dateOfBirth instanceof Date &&
      !Number.isNaN(body.dateOfBirth.getTime());

    if (!hasFullName && !hasDob) {
      throw new BadRequestException(
        'Gửi ít nhất fullName hoặc dateOfBirth hợp lệ',
      );
    }

    await this.updateProfileHandler.execute(
      new UpdateProfileCommand(
        userId,
        hasFullName ? body.fullName!.trim() : undefined,
        hasDob ? body.dateOfBirth : undefined,
        undefined,
      ),
    );
  }
}
