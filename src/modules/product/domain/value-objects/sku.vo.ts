export class Sku {
  private constructor(private readonly _value: string) {}

  static create(raw: string): Sku {
    if (!raw) throw new InvalidSkuError();

    const value = raw.trim().toUpperCase();

    if (!/^[A-Z0-9-]+$/.test(value)) {
      throw new InvalidSkuError('Invalid format');
    }

    return new Sku(value);
  }

  get value(): string {
    return this._value;
  }
}

export class InvalidSkuError extends Error {
  constructor(message = 'Invalid Sku.') {
    super(message);
    this.name = 'InvalidSkuError';
  }
}
