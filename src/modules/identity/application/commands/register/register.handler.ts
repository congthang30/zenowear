import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { AccountStatus } from 'src/modules/identity/domain/enum/account-status.enum';
import { RoleAccount } from 'src/modules/identity/domain/enum/role.enum';
import type { UserRepository } from 'src/modules/user/domain/repositories/user.repository';
import { USER_REPOSITORY } from 'src/modules/user/application/user-repository.token';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
import {
  parseDateOfBirth,
  parseEmail,
  parseFullName,
  parsePassword,
} from '../../parse-identity-value-objects';
import { RegisterCommand } from './register.command';

@Injectable()
export class RegisterHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: RegisterCommand): Promise<{ userId: string }> {
    if (command.password !== command.rePassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    const email = parseEmail(command.email);
    const fullName = parseFullName(command.fullName);
    const password = await parsePassword(command.password);
    const dateOfBirth = await parseDateOfBirth(command.dateOfBirth);

    const existingEmail = await this.identityRepository.findByEmail(
      email.value,
    );

    if (existingEmail) {
      throw new BadRequestException(
        'The email address already exists on another account.',
      );
    }

    const user = await this.userRepository.create({
      fullName: fullName.value,
      dateOfBirth: dateOfBirth.value,
    });

    const userId = user._id!.toString();

    await this.identityRepository.create({
      userId,
      email: email.value,
      password: password.value,
      accountStatus: AccountStatus.ACTIVE,
      failedLoginCount: 0,
      role: RoleAccount.CUSTOMER,
    });

    return { userId };
  }
}
