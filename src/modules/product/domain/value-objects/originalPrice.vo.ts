export class OriginalPrice {
  private constructor(private readonly _value: number) {}

  static create(price: number): OriginalPrice {
    if (price === null || price === undefined) {
      throw new InvalidOriginalPriceError('Original price is required');
    }

    if (!Number.isFinite(price)) {
      throw new InvalidOriginalPriceError(
        'Original price must be a finite number',
      );
    }

    if (price < 0) {
      throw new InvalidOriginalPriceError('Original price must be >= 0');
    }

    return new OriginalPrice(price);
  }

  get value(): number {
    return this._value;
  }

  equals(other: OriginalPrice): boolean {
    return this._value === other._value;
  }

  static reconstitute(value: number): OriginalPrice {
    return new OriginalPrice(value);
  }
}

export class InvalidOriginalPriceError extends Error {
  constructor(message = 'Invalid original price.') {
    super(message);
    this.name = 'InvalidOriginalPriceError';
  }
}
