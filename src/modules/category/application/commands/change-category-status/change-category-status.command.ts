import { CategoryStatus } from '../../../domain/enum/category-status.enum';

export class ChangeCategoryStatusCommand {
  constructor(
    readonly id: string,
    readonly status: CategoryStatus,
  ) {}
}
