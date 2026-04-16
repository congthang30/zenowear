import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { parseEmail } from '../../../../identity/application/parse-identity-value-objects';
import type { AdminChangeEmailDto } from '../../dtos/admin-change-email.dto';

@Injectable()
export class AdminChangeUserEmailHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
  ) {}

  async execute(userId: string, body: AdminChangeEmailDto): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const identity = await this.identityRepository.findByIdUser(userId);
    if (!identity) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const nextEmail = parseEmail(body.email);
    if (identity.email.equals(nextEmail)) {
      return;
    }

    const existing = await this.identityRepository.findByEmail(nextEmail.value);
    if (existing && existing.userId !== userId) {
      throw new BadRequestException(
        'Email đã được gán cho tài khoản khác.',
      );
    }

    identity.changeEmailByAdmin(nextEmail);
    await this.identityRepository.save(identity);
  }
}
