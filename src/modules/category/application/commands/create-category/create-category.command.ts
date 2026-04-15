import { CategoryStatus } from '../../../domain/enum/category-status.enum';

export class CreateCategoryCommand {
  constructor(
    readonly name: string,
    readonly parentId?: string | null,
    readonly status?: CategoryStatus,
  ) {}
}
