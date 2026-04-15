import { BrandStatus } from '../enum/brand-status.enum';
import { BrandName } from '../value-objects/brand-name.vo';

export type BrandReconstituteProps = {
  id: string;
  brandName: BrandName;
  brandStatus: BrandStatus;
  logo: string | null;
  description: string | null;
};

export class Brand {
  private constructor(
    private readonly _id: string | undefined,
    private _name: BrandName,
    private _logo: string | null,
    private _description: string | null,
    private _status: BrandStatus,
  ) {}

  static create(props: {
    name: BrandName;
    logo?: string | null;
    description?: string | null;
    status?: BrandStatus;
  }): Brand {
    return new Brand(
      undefined,
      props.name,
      props.logo ?? null,
      props.description ?? null,
      props.status ?? BrandStatus.DRAFT,
    );
  }

  static reconstitute(props: BrandReconstituteProps): Brand {
    return new Brand(
      props.id,
      props.brandName,
      props.logo,
      props.description,
      props.brandStatus,
    );
  }

  updateDetails(props: {
    name?: BrandName;
    logo?: string | null;
    description?: string | null;
  }) {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.logo !== undefined) {
      this._logo = props.logo;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
  }

  applyStatus(newStatus: BrandStatus) {
    this._status = newStatus;
  }

  softDelete() {
    this._status = BrandStatus.INACTIVE;
  }

  get id(): string | undefined {
    return this._id;
  }

  get Id(): string | undefined {
    return this._id;
  }

  get brandName(): BrandName {
    return this._name;
  }

  get logo(): string | null {
    return this._logo;
  }

  get description(): string | null {
    return this._description;
  }

  get status(): BrandStatus {
    return this._status;
  }
}
