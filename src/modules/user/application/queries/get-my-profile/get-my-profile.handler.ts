import { Inject, Injectable } from '@nestjs/common';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../user-repository.token';
import { UserResponseDto } from '../../dtos/user-profile-response.dto';
import { GetMyProfileQuery } from './get-my-profile.query';

@Injectable()
export class GetMyProfileHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetMyProfileQuery): Promise<UserResponseDto | null> {
    const profile = await this.userRepository.findByUserId(query.userId);
    if (!profile) {
      return null;
    }
    return UserResponseDto.fromProfile(profile);
  }
}
