import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  save(category: Category): Promise<void>;
  create(category: Category): Promise<void>;
}
