export class DiscountPercent {
  private constructor(private readonly _value: number) {}

  static create(raw: number): DiscountPercent {
    if (raw === null || raw === undefined) {
      throw new InvalidDiscountPercentError('Discount percent is required');
    }

    if (raw < 1 || raw > 100) {
      throw new InvalidDiscountPercentError(
        'Discount percent must be between 1 and 100',
      );
    }

    return new DiscountPercent(raw);
  }

  get value(): number {
    return this._value;
  }

  equals(other: DiscountPercent): boolean {
    return this._value === other._value;
  }
}

export class InvalidDiscountPercentError extends Error {
  constructor(message = 'Invalid discount percent.') {
    super(message);
    this.name = 'InvalidDiscountPercentError';
  }
}
