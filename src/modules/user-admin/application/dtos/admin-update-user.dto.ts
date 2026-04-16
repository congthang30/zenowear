import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '../../../identity/domain/enum/account-status.enum';
import { RoleAccount } from '../../../identity/domain/enum/role.enum';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ enum: RoleAccount })
  @IsOptional()
  @IsEnum(RoleAccount)
  role?: RoleAccount;

  @ApiPropertyOptional({ enum: AccountStatus })
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;
}
