import { BadRequestException } from '@nestjs/common';
import { AccountStatus } from '../enum/account-status.enum';
import { RoleAccount } from '../enum/role.enum';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export class IdentityCredential {
  private constructor(
    private readonly _userId: string,
    private readonly _email: Email,
    private _password: Password,
    private _role: RoleAccount,
    private _accountStatus: AccountStatus,
    private _failedLoginCount: number,
    private _lockedAt?: Date,
  ) {}

  static createForNewUser(props: {
    userId: string;
    email: Email;
    hashedPassword: Password;
    role: RoleAccount;
  }): IdentityCredential {
    return new IdentityCredential(
      props.userId,
      props.email,
      props.hashedPassword,
      props.role,
      AccountStatus.ACTIVE,
      0,
      undefined,
    );
  }

  static reconstitute(props: {
    userId: string;
    email: Email;
    password: Password;
    role: RoleAccount;
    accountStatus: AccountStatus;
    failedLoginCount: number;
    lockedAt?: Date;
  }): IdentityCredential {
    return new IdentityCredential(
      props.userId,
      props.email,
      props.password,
      props.role,
      props.accountStatus,
      props.failedLoginCount,
      props.lockedAt,
    );
  }

  get userId(): string {
    return this._userId;
  }

  get email(): Email {
    return this._email;
  }

  get role(): RoleAccount {
    return this._role;
  }

  get accountStatus(): AccountStatus {
    return this._accountStatus;
  }

  get failedLoginCount(): number {
    return this._failedLoginCount;
  }

  get lockedAt(): Date | undefined {
    return this._lockedAt;
  }

  get passwordHash(): string {
    return this._password.value;
  }

  verifyPassword(plain: string): Promise<boolean> {
    return this._password.compare(plain);
  }

  async changePassword(
    oldPassword: string,
    newPassword: Password,
  ): Promise<void> {
    if (!(await this._password.compare(oldPassword))) {
      throw new BadRequestException('Old password is incorrect');
    }

    this._password = newPassword;
  }
}
