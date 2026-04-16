import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { USER_REPOSITORY } from '../../../../user/application/user-repository.token';
import type { UserRepository } from '../../../../user/domain/repositories/user.repository';
import { AdminUserDetailDto } from '../../dtos/admin-user-response.dto';

@Injectable()
export class GetAdminUserDetailHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string): Promise<AdminUserDetailDto> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const entry = await this.identityRepository.findEntryByUserId(userId);
    if (!entry) {
      throw new NotFoundException(`Không tìm thấy user: ${userId}`);
    }

    const identity = entry.credential;
    const profile = await this.userRepository.findByUserId(userId);

    const dto = new AdminUserDetailDto();
    dto.userId = identity.userId;
    dto.email = identity.email.value;
    dto.role = identity.role;
    dto.accountStatus = identity.accountStatus;
    dto.fullName = profile?.fullName.value;
    dto.avatar = profile?.avatar;
    dto.dateOfBirth = profile?.dateOfBirth.value;
    dto.failedLoginCount = identity.failedLoginCount;
    dto.lockedAt = identity.lockedAt;
    dto.createdAt = entry.createdAt;
    dto.updatedAt = entry.updatedAt;
    return dto;
  }
}
