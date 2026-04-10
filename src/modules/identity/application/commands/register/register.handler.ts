import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IdentityRepository } from '../../../domain/repositories/identity.repository';
import { IdentityCredential } from '../../../domain/entities/identity-credential.entity';
import { RoleAccount } from '../../../domain/enum/role.enum';
import type { UserRepository } from '../../../../user/domain/repositories/user.repository';
import { UserProfile } from '../../../../user/domain/entities/user-profile.entity';
import { USER_REPOSITORY } from '../../../../user/application/user-repository.token';
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
    const hashedPassword = await parsePassword(command.password);
    const dateOfBirth = parseDateOfBirth(command.dateOfBirth);

    const existing = await this.identityRepository.findByEmail(email.value);

    if (existing) {
      throw new BadRequestException(
        'The email address already exists on another account.',
      );
    }

    const profile = UserProfile.newForRegistration(fullName, dateOfBirth);
    const savedProfile = await this.userRepository.create(profile);
    const userId = savedProfile.assertId();

    const credential = IdentityCredential.createForNewUser({
      userId,
      email,
      hashedPassword,
      role: RoleAccount.CUSTOMER,
    });

    await this.identityRepository.create(credential);

    return { userId };
  }
}
