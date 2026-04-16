import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus } from '../../../identity/domain/enum/account-status.enum';
import { RoleAccount } from '../../../identity/domain/enum/role.enum';

export class AdminUserListItemDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: RoleAccount })
  role: RoleAccount;

  @ApiProperty({ enum: AccountStatus })
  accountStatus: AccountStatus;

  @ApiPropertyOptional()
  fullName?: string;

  @ApiPropertyOptional()
  avatar?: string;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserListItemDto] })
  items: AdminUserListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class AdminUserDetailDto extends AdminUserListItemDto {
  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiProperty()
  failedLoginCount: number;

  @ApiPropertyOptional()
  lockedAt?: Date;
}
