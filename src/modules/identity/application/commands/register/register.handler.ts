import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { AccountStatus } from 'src/modules/identity/domain/enum/account-status.enum';
import { RoleAccount } from 'src/modules/identity/domain/enum/role.enum';
import type { UserRepository } from 'src/modules/user/domain/repositories/user.repository';
import { USER_REPOSITORY } from 'src/modules/user/application/user-repository.token';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
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

    const existingEmail = await this.identityRepository.findByEmail(
      command.email,
    );

    if (existingEmail) {
      throw new BadRequestException(
        'The email address already exists on another account.',
      );
    }

    const hashedPassword = await bcrypt.hash(command.password, 12);

    const user = await this.userRepository.create({
      fullName: command.fullName,
      dateOfBirth: command.dateOfBirth,
    });

    const userId = user._id!.toString();

    await this.identityRepository.create({
      userId,
      email: command.email,
      password: hashedPassword,
      accountStatus: AccountStatus.ACTIVE,
      failedLoginCount: 0,
      role: RoleAccount.CUSTOMER,
    });

    return { userId };
  }
}
