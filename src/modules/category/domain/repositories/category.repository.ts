import { Category } from '../entities/category.entity';
import { CategoryStatus } from '../enum/category-status.enum';

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  /** Tất cả danh mục ACTIVE (phẳng). */
  findAllActive(): Promise<Category[]>;
  /** Tất cả bản ghi (admin / build tree khi cần). */
  findAll(): Promise<Category[]>;
  save(category: Category): Promise<void>;
  /** Tạo mới, trả về id Mongo. */
  create(category: Category): Promise<string>;
}
