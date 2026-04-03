import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChangeMyPasswordCommand } from './change-my-password.command';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { Password } from 'src/modules/identity/domain/value-objects/password.vo';

@Injectable()
export class ChangeMyPasswordHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
  ) {}

  async execute(command: ChangeMyPasswordCommand): Promise<void> {
    const identity = await this.identityRepository.findByIdUser(command.userId);

    if (!identity) {
      throw new NotFoundException('User not found');
    }

    if (command.newPassword !== command.reNewPass) {
      throw new BadRequestException('Passwords do not match');
    }

    const newPassword = await Password.create(command.newPassword);

    await identity.changePassword(command.password, newPassword);

    await this.identityRepository.save(identity);
  }
}
