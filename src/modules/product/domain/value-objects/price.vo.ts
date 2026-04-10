export class Price {
  private constructor(private readonly _value: number) {}

  static create(price: number): Price {
    if (price === null || price === undefined) {
      throw new InvalidPriceError('Price is required');
    }

    if (!Number.isFinite(price)) {
      throw new InvalidPriceError('Price must be a finite number');
    }

    if (price < 0) {
      throw new InvalidPriceError('Price must be >= 0');
    }

    return new Price(price);
  }

  get value(): number {
    return this._value;
  }

  equals(other: Price): boolean {
    return this._value === other._value;
  }
}

export class InvalidPriceError extends Error {
  constructor(message = 'Invalid price.') {
    super(message);
    this.name = 'InvalidPriceError';
  }
}
