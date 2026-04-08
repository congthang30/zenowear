import { BrandStatus } from '../enum/brand-status.enum';
import { BrandName } from '../value-objects/brand-name.vo';

export class Brand {
  private constructor(
    private readonly _id: string | undefined,
    private _name: BrandName,
    private _status: BrandStatus,
  ) {}

  static create(props: { name: BrandName; status?: BrandStatus }): Brand {
    return new Brand(undefined, props.name, props.status ?? BrandStatus.ACTIVE);
  }

  static reconstitute(props: {
    id: string;
    brandName: BrandName;
    brandStatus: BrandStatus;
  }): Brand {
    return new Brand(props.id, props.brandName, props.brandStatus);
  }

  activate() {
    this._status = BrandStatus.ACTIVE;
  }

  deactivate() {
    this._status = BrandStatus.INACTIVE;
  }

  get brandName(): BrandName {
    return this._name;
  }

  get status(): BrandStatus {
    return this._status;
  }

  get Id(): string | undefined {
    return this._id;
  }
}
