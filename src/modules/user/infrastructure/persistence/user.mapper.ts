import { UserProfile } from '../../domain/entities/user-profile.entity';
import { DateOfBirth } from '../../domain/value-objects/date-of-birth.vo';
import { FullName } from '../../domain/value-objects/full-name.vo';
import { UserDocument } from './user.orm-entity';

export class UserMapper {
  static toDomain(doc: UserDocument): UserProfile {
    if (doc._id == null) {
      throw new Error('UserDocument thiếu _id');
    }
    return UserProfile.reconstitute({
      id: doc._id.toString(),
      fullName: FullName.create(doc.fullName),
      dateOfBirth: DateOfBirth.create(doc.dateOfBirth),
      avatar: doc.avatar,
    });
  }

  static toPersistence(profile: UserProfile): {
    fullName: string;
    dateOfBirth: Date;
    avatar?: string;
  } {
    return {
      fullName: profile.fullName.value,
      dateOfBirth: profile.dateOfBirth.value,
      avatar: profile.avatar,
    };
  }
}
