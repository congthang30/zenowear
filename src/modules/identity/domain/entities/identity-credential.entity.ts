import { BadRequestException } from '@nestjs/common';
import { AccountStatus } from '../enum/account-status.enum';
import { RoleAccount } from '../enum/role.enum';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';

export class IdentityCredential {
  private constructor(
    private readonly _userId: string,
    private _email: Email,
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

  /** Cập nhật role / trạng thái tài khoản từ luồng admin (không đổi mật khẩu). */
  applyAdminUpdate(props: {
    role?: RoleAccount;
    accountStatus?: AccountStatus;
  }): void {
    if (props.role !== undefined) {
      this._role = props.role;
    }
    if (props.accountStatus !== undefined) {
      const next = props.accountStatus;
      this._accountStatus = next;
      if (next === AccountStatus.ACTIVE) {
        this._failedLoginCount = 0;
        this._lockedAt = undefined;
      } else if (
        next === AccountStatus.LOCKED ||
        next === AccountStatus.DISABLED
      ) {
        this._lockedAt = new Date();
      }
    }
  }

  /** Đổi email (luồng admin): caller đảm bảo không trùng user khác. */
  changeEmailByAdmin(newEmail: Email): void {
    this._email = newEmail;
  }

  /**
   * Đặt lại mật khẩu từ admin: hash mới, xóa bộ đếm đăng nhập sai.
   * Nếu tài khoản đang LOCKED (thường do sai mật khẩu), mở khóa về ACTIVE.
   * DISABLED không tự động bật lại — admin phải đổi trạng thái riêng.
   */
  applyAdminPasswordReset(hashedPassword: Password): void {
    this._password = hashedPassword;
    this._failedLoginCount = 0;
    if (this._accountStatus === AccountStatus.LOCKED) {
      this._lockedAt = undefined;
      this._accountStatus = AccountStatus.ACTIVE;
    }
  }
}
