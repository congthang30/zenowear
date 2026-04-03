import { IdentityCredential } from '../entities/identity-credential.entity';

export interface IdentityRepository {
  findByEmail(email: string): Promise<IdentityCredential | null>;
  findByIdUser(id: string): Promise<IdentityCredential | null>;
  save(identity: IdentityCredential): Promise<void>;
  create(identity: IdentityCredential): Promise<void>;
}
