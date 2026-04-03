import { IdentityCredential } from '../../domain/entities/identity-credential.entity';
import { AccountStatus } from '../../domain/enum/account-status.enum';
import { RoleAccount } from '../../domain/enum/role.enum';
import { Email } from '../../domain/value-objects/email.vo';
import { Password } from '../../domain/value-objects/password.vo';
import { IdentityDocument } from './identity.orm-entity';

export class IdentityMapper {
  static toDomain(doc: IdentityDocument): IdentityCredential {
    return IdentityCredential.reconstitute({
      userId: doc.userId,
      email: Email.create(doc.email),
      password: Password.fromHash(doc.password),
      role: doc.role,
      accountStatus: doc.accountStatus,
      failedLoginCount: doc.failedLoginCount,
      lockedAt: doc.lockedAt,
    });
  }

  static toPersistence(entity: IdentityCredential): {
    userId: string;
    email: string;
    password: string;
    accountStatus: AccountStatus;
    failedLoginCount: number;
    lockedAt?: Date;
    role: RoleAccount;
  } {
    return {
      userId: entity.userId,
      email: entity.email.value,
      password: entity.passwordHash,
      accountStatus: entity.accountStatus,
      failedLoginCount: entity.failedLoginCount,
      lockedAt: entity.lockedAt,
      role: entity.role,
    };
  }
}
