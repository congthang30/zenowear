import { UserProfile } from '../entities/user-profile.entity';

export interface UserRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(user: UserProfile): Promise<void>;
  create(user: UserProfile): Promise<UserProfile>;
}
