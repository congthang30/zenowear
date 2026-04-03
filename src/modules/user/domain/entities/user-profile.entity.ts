import { DateOfBirth } from '../value-objects/date-of-birth.vo';
import { FullName } from '../value-objects/full-name.vo';

export class UserProfile {
  private constructor(
    private readonly _id: string | undefined,
    private readonly _fullName: FullName,
    private readonly _dateOfBirth: DateOfBirth,
    private readonly _avatar?: string,
  ) {}

  static newForRegistration(
    fullName: FullName,
    dateOfBirth: DateOfBirth,
  ): UserProfile {
    return new UserProfile(undefined, fullName, dateOfBirth, undefined);
  }

  static reconstitute(props: {
    id: string;
    fullName: FullName;
    dateOfBirth: DateOfBirth;
    avatar?: string;
  }): UserProfile {
    return new UserProfile(
      props.id,
      props.fullName,
      props.dateOfBirth,
      props.avatar,
    );
  }

  get id(): string | undefined {
    return this._id;
  }

  assertId(): string {
    if (this._id == null || this._id === '') {
      throw new Error('UserProfile chưa có id');
    }
    return this._id;
  }

  get fullName(): FullName {
    return this._fullName;
  }

  get dateOfBirth(): DateOfBirth {
    return this._dateOfBirth;
  }

  get avatar(): string | undefined {
    return this._avatar;
  }

  update(props: {
    fullName?: FullName;
    dateOfBirth?: DateOfBirth;
    avatar?: string;
  }): UserProfile {
    return new UserProfile(
      this._id,
      props.fullName ?? this._fullName,
      props.dateOfBirth ?? this._dateOfBirth,
      props.avatar !== undefined ? props.avatar : this._avatar,
    );
  }
}
