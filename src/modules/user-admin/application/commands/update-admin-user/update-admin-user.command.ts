import type { AccountStatus } from '../../../../identity/domain/enum/account-status.enum';
import type { RoleAccount } from '../../../../identity/domain/enum/role.enum';

export class UpdateAdminUserCommand {
  constructor(
    public readonly targetUserId: string,
    public readonly actorUserId: string,
    public readonly role?: RoleAccount,
    public readonly accountStatus?: AccountStatus,
  ) {}
}
