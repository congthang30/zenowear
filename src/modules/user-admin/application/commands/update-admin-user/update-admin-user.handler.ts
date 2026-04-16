import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { AccountStatus } from '../../../../identity/domain/enum/account-status.enum';
import { RoleAccount } from '../../../../identity/domain/enum/role.enum';
import { UpdateAdminUserCommand } from './update-admin-user.command';

@Injectable()
export class UpdateAdminUserHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
  ) {}

  async execute(command: UpdateAdminUserCommand): Promise<void> {
    if (command.role === undefined && command.accountStatus === undefined) {
      throw new BadRequestException('Gửi ít nhất một trong: role, accountStatus');
    }

    if (!Types.ObjectId.isValid(command.targetUserId)) {
      throw new NotFoundException(`Không tìm thấy user: ${command.targetUserId}`);
    }

    const identity = await this.identityRepository.findByIdUser(
      command.targetUserId,
    );
    if (!identity) {
      throw new NotFoundException(`Không tìm thấy user: ${command.targetUserId}`);
    }

    const self = command.actorUserId === command.targetUserId;
    if (self) {
      if (
        command.role !== undefined &&
        command.role !== RoleAccount.ADMIN
      ) {
        throw new BadRequestException('Không thể tự hạ quyền ADMIN của chính mình');
      }
      if (
        command.accountStatus !== undefined &&
        command.accountStatus !== AccountStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'Không thể tự khóa / vô hiệu hóa tài khoản của chính mình',
        );
      }
    }

    identity.applyAdminUpdate({
      role: command.role,
      accountStatus: command.accountStatus,
    });

    await this.identityRepository.save(identity);
  }
}
