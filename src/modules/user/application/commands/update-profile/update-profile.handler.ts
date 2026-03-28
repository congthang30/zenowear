import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../user-repository.token';
import { UpdateProfileCommand } from './update-profile.command';

@Injectable()
export class UpdateProfileHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const existing = await this.userRepository.findByUserId(command.userId);
    if (!existing) {
      throw new NotFoundException(
        `Không tìm thấy user với userId: ${command.userId}`,
      );
    }

    if (command.fullName !== undefined) existing.fullName = command.fullName;
    if (command.dateOfBirth !== undefined)
      existing.dateOfBirth = command.dateOfBirth;
    if (command.avatar !== undefined) existing.avatar = command.avatar;

    await this.userRepository.save(existing);
  }
}
