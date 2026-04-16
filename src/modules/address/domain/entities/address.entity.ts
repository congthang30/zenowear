export type AddressSnapshot = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  city: string;
  country?: string;
};

type AddressProps = {
  id?: string;
  userId: string;
} & AddressSnapshot;

export class Address {
  private constructor(
    private readonly _id: string | undefined,
    private readonly _userId: string,
    private _fullName: string,
    private _phone: string,
    private _line1: string,
    private _line2: string | undefined,
    private _district: string | undefined,
    private _city: string,
    private _country: string | undefined,
  ) {}

  static create(
    userId: string,
    data: Omit<AddressSnapshot, 'country'> & { country?: string },
  ): Address {
    return new Address(
      undefined,
      userId,
      data.fullName,
      data.phone,
      data.line1,
      data.line2,
      data.district,
      data.city,
      data.country ?? 'VN',
    );
  }

  static reconstitute(props: AddressProps): Address {
    return new Address(
      props.id,
      props.userId,
      props.fullName,
      props.phone,
      props.line1,
      props.line2,
      props.district,
      props.city,
      props.country ?? 'VN',
    );
  }

  update(
    patch: Partial<
      Omit<AddressSnapshot, 'country'> & { country?: string }
    >,
  ): void {
    if (patch.fullName !== undefined) this._fullName = patch.fullName;
    if (patch.phone !== undefined) this._phone = patch.phone;
    if (patch.line1 !== undefined) this._line1 = patch.line1;
    if (patch.line2 !== undefined) this._line2 = patch.line2;
    if (patch.district !== undefined) this._district = patch.district;
    if (patch.city !== undefined) this._city = patch.city;
    if (patch.country !== undefined) this._country = patch.country;
  }

  toSnapshot(): AddressSnapshot {
    return {
      fullName: this._fullName,
      phone: this._phone,
      line1: this._line1,
      line2: this._line2,
      district: this._district,
      city: this._city,
      country: this._country,
    };
  }

  get id(): string | undefined {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
}
