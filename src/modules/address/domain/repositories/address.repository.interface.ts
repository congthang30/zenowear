import type { Address } from '../entities/address.entity';

export interface IAddressRepository {
  create(address: Address): Promise<string>;
  save(address: Address): Promise<void>;
  findByIdAndUserId(id: string, userId: string): Promise<Address | null>;
  listByUserId(userId: string): Promise<Address[]>;
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>;
}
