import { IdentityDocument } from '../../infrastructure/persistence/identity.orm-entity';

export interface IdentityRepository {
  findByEmail(email: string): Promise<IdentityDocument | null>;
  save(identity: IdentityDocument): Promise<void>;
  create(identity: IdentityDocument): Promise<void>;
}
