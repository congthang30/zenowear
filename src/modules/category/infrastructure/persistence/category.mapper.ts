import { Category } from '../../domain/entities/category-credential.entity';
import { CategoryStatus } from '../../domain/enum/category-status.enum';
import { CategoryName } from '../../domain/value-objects/category-name.vo';
import { CategoryDocument } from './category.orm-entity';

export class CategoryMapper {
  static toDomain(doc: CategoryDocument): Category {
    return Category.reconstitute({
      id: doc._id.toString(),
      categoryName: CategoryName.create(doc.categoryName),
      categoryStatus: doc.categoryStatus,
    });
  }

  static toPersistence(entity: Category): {
    id: string | undefined;
    categoryName: string;
    categoryStatus: CategoryStatus;
  } {
    return {
      id: entity.Id,
      categoryName: entity.categoryName.value,
      categoryStatus: entity.status,
    };
  }
}
