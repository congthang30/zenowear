import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enum/category-status.enum';
import { CategoryName } from '../../domain/value-objects/category-name.vo';
import { CategoryDocument } from './category.orm-entity';

export class CategoryMapper {
  static toDomain(doc: CategoryDocument): Category {
    return Category.reconstitute({
      id: doc._id.toString(),
      categoryName: CategoryName.reconstitute(doc.categoryName),
      categoryStatus: doc.categoryStatus,
      parentId: doc.parentId ? doc.parentId.toString() : null,
    });
  }

  static toPersistence(entity: Category): {
    id: string | undefined;
    categoryName: string;
    categoryStatus: CategoryStatus;
    parentId: string | null;
  } {
    return {
      id: entity.id,
      categoryName: entity.categoryName.value,
      categoryStatus: entity.status,
      parentId: entity.parentId,
    };
  }
}
