import { Brand } from '../entities/brand.entity';

export interface BrandRepository {
  findById(id: string): Promise<Brand | null>;
  save(brand: Brand): Promise<void>;
  create(brand: Brand): Promise<void>;
}
