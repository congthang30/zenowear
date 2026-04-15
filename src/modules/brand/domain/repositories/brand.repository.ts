import { Brand } from '../entities/brand.entity';

export interface BrandRepository {
  findById(id: string): Promise<Brand | null>;
  findByNormalizedName(normalized: string): Promise<Brand | null>;
  findAllActive(): Promise<Brand[]>;
  save(brand: Brand): Promise<void>;
  create(brand: Brand): Promise<string>;
}
