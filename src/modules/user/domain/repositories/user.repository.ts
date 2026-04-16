import { UserProfile } from '../entities/user-profile.entity';

export interface UserRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  findByUserIds(userIds: string[]): Promise<UserProfile[]>;
  save(user: UserProfile): Promise<void>;
  create(user: UserProfile): Promise<UserProfile>;
}
