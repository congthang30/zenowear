import { UserDocument } from '../../infrastructure/persistence/user.orm-entity';

export interface UserRepository {
  findByUserId(userId: string): Promise<UserDocument | null>;
  save(user: UserDocument): Promise<void>;
  create(user: UserDocument): Promise<UserDocument>;
}
