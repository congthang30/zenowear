import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IDENTITY_REPOSITORY } from '../../identity-repository.token';
import type { IdentityRepository } from 'src/modules/identity/domain/repositories/identity.repository';
import { LoginCommand } from './login.command';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    private readonly jwtService: JwtService,
  ) {}

  async excute(command: LoginCommand): Promise<{ token: string }> {
    const user = await this.identityRepository.findByEmail(command.email);

    if (!user)
      throw new BadRequestException('The email address does not exist.');

    const isMatch = await bcrypt.compare(command.password, user.password);

    if (!isMatch) {
      throw new BadRequestException(
        'The password you just entered is incorrect.',
      );
    }

    const payload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return { token };
  }
}
