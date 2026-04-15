import { CategoryStatus } from '../enum/category-status.enum';
import { CategoryName } from '../value-objects/category-name.vo';

export type CategoryReconstituteProps = {
  id: string;
  categoryName: CategoryName;
  categoryStatus: CategoryStatus;
  parentId: string | null;
};

export class Category {
  private constructor(
    private readonly _id: string | undefined,
    private _name: CategoryName,
    private _parentId: string | null,
    private _status: CategoryStatus,
  ) {}

  static create(props: {
    name: CategoryName;
    parentId?: string | null;
    status?: CategoryStatus;
  }): Category {
    return new Category(
      undefined,
      props.name,
      props.parentId ?? null,
      props.status ?? CategoryStatus.DRAFT,
    );
  }

  static reconstitute(props: CategoryReconstituteProps): Category {
    return new Category(
      props.id,
      props.categoryName,
      props.parentId,
      props.categoryStatus,
    );
  }

  updateDetails(props: { name?: CategoryName; parentId?: string | null }) {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.parentId !== undefined) {
      this._parentId = props.parentId;
    }
  }

  applyStatus(
    newStatus: CategoryStatus,
    context: { parent: Category | null },
  ) {
    if (newStatus === CategoryStatus.ACTIVE) {
      if (this._parentId) {
        const p = context.parent;
        if (!p || p.status !== CategoryStatus.ACTIVE) {
          throw new Error(
            'Không thể kích hoạt: danh mục cha phải tồn tại và đang ACTIVE',
          );
        }
      }
    }
    this._status = newStatus;
  }

  softDelete() {
    this._status = CategoryStatus.INACTIVE;
  }

  get id(): string | undefined {
    return this._id;
  }

  get Id(): string | undefined {
    return this._id;
  }

  get categoryName(): CategoryName {
    return this._name;
  }

  get parentId(): string | null {
    return this._parentId;
  }

  get status(): CategoryStatus {
    return this._status;
  }
}
