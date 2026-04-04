import { CategoryStatus } from '../enum/category-status.enum';
import { CategoryName } from '../value-objects/category-name.vo';

export class Category {
  private constructor(
    private readonly _id: string | undefined,
    private _name: CategoryName,
    private _status: CategoryStatus,
  ) {}

  static create(props: {
    name: CategoryName;
    status?: CategoryStatus;
  }): Category {
    return new Category(
      undefined,
      props.name,
      props.status ?? CategoryStatus.ACTIVE,
    );
  }

  static reconstitute(props: {
    id: string;
    categoryName: CategoryName;
    categoryStatus: CategoryStatus;
  }): Category {
    return new Category(props.id, props.categoryName, props.categoryStatus);
  }

  activate() {
    this._status = CategoryStatus.ACTIVE;
  }

  deactivate() {
    this._status = CategoryStatus.INACTIVE;
  }

  get categoryName(): CategoryName {
    return this._name;
  }

  get status(): CategoryStatus {
    return this._status;
  }

  get Id(): string | undefined {
    return this._id;
  }
}
