import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { LoginCommand } from './login.command';
import { JwtService } from '@nestjs/jwt';
import { parseEmail } from '../../parse-identity-value-objects';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginCommand): Promise<{ token: string }> {
    const email = parseEmail(command.email);
    const credential = await this.identityRepository.findByEmail(email.value);

    if (!credential) {
      throw new BadRequestException('The email address does not exist.');
    }

    const ok = await credential.verifyPassword(command.password);
    if (!ok) {
      throw new BadRequestException(
        'The password you just entered is incorrect.',
      );
    }

    const payload = {
      userId: credential.userId,
      email: credential.email.value,
      role: credential.role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }
}
