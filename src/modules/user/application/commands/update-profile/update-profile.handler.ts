import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../user-repository.token';
import {
  DateOfBirth,
  InvalidDateOfBirthError,
} from '../../../domain/value-objects/date-of-birth.vo';
import {
  FullName,
  InvalidFullNameError,
} from '../../../domain/value-objects/full-name.vo';
import { UpdateProfileCommand } from './update-profile.command';

@Injectable()
export class UpdateProfileHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const profile = await this.userRepository.findByUserId(command.userId);
    if (!profile) {
      throw new NotFoundException(`User not found: ${command.userId}`);
    }

    let next = profile;

    try {
      if (command.fullName !== undefined) {
        next = next.update({ fullName: FullName.create(command.fullName) });
      }
      if (command.dateOfBirth !== undefined) {
        next = next.update({
          dateOfBirth: DateOfBirth.create(command.dateOfBirth),
        });
      }
      if (command.avatar !== undefined) {
        next = next.update({ avatar: command.avatar });
      }
    } catch (e) {
      if (
        e instanceof InvalidFullNameError ||
        e instanceof InvalidDateOfBirthError
      ) {
        throw new BadRequestException((e as Error).message);
      }
      throw e;
    }

    await this.userRepository.save(next);
  }
}
