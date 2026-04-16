import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import {
  parsePassword,
} from '../../../../identity/application/parse-identity-value-objects';
import type { AdminResetPasswordDto } from '../../dtos/admin-reset-password.dto';

@Injectable()
export class AdminResetUserPasswordHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
  ) {}

  async execute(
    userId: string,
    body: AdminResetPasswordDto,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    if (body.newPassword !== body.rePassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const identity = await this.identityRepository.findByIdUser(userId);
    if (!identity) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const hashed = await parsePassword(body.newPassword);
    identity.applyAdminPasswordReset(hashed);
    await this.identityRepository.save(identity);
  }
}
