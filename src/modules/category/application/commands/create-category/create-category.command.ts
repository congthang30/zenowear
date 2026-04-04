import { CategoryStatus } from 'src/modules/category/domain/enum/category-status.enum';

export class CreateCategoryCommand {
  status: CategoryStatus;
  constructor(
    readonly categoryName: string,
    readonly categoryStatus: CategoryStatus,
  ) {}
}
