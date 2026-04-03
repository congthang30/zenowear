import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserProfile } from '../../domain/entities/user-profile.entity';

export class UserResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  avatar?: string;

  static fromProfile(profile: UserProfile): UserResponseDto {
    const dto = new UserResponseDto();
    dto.userId = profile.assertId();
    dto.fullName = profile.fullName.value;
    dto.dateOfBirth = profile.dateOfBirth.value;
    dto.avatar = profile.avatar;
    return dto;
  }
}
