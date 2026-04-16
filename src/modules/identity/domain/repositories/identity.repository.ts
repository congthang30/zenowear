import { IdentityCredential } from '../entities/identity-credential.entity';
import type { AccountStatus } from '../enum/account-status.enum';
import type { RoleAccount } from '../enum/role.enum';

export type IdentityListEntry = {
  credential: IdentityCredential;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IdentityRepository {
  findByEmail(email: string): Promise<IdentityCredential | null>;
  findByIdUser(id: string): Promise<IdentityCredential | null>;
  findEntryByUserId(id: string): Promise<IdentityListEntry | null>;
  save(identity: IdentityCredential): Promise<void>;
  create(identity: IdentityCredential): Promise<void>;
  findPaged(params: {
    skip: number;
    limit: number;
    emailContains?: string;
    role?: RoleAccount;
    accountStatus?: AccountStatus;
  }): Promise<{ items: IdentityListEntry[]; total: number }>;
}
