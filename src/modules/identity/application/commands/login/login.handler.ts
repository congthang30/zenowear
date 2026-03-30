import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { LoginCommand } from './login.command';
import { JwtService } from '@nestjs/jwt';
import {
  assertPasswordMatchesStored,
  parseEmail,
} from '../../parse-identity-value-objects';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<{ token: string }> {
    const email = parseEmail(command.email);
    const user = await this.identityRepository.findByEmail(email.value);

    if (!user)
      throw new BadRequestException('The email address does not exist.');

    await assertPasswordMatchesStored(command.password, user.password);

    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }
}
