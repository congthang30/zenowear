export class Stock {
  private constructor(
    private readonly _available: number,
    private readonly _reserved: number,
  ) { }

  static create(available: number, reserved: number = 0): Stock {
    if (available < 0 || reserved < 0) {
      throw new Error('Stock cannot be negative');
    }
    return new Stock(available, reserved);
  }

  static reconstitute(available: number, reserved: number = 0): Stock {
    return new Stock(available, reserved);
  }

  get available(): number {
    return this._available;
  }

  get reserved(): number {
    return this._reserved;
  }

  get total(): number {
    return this._available + this._reserved;
  }

  reserve(quantity: number): Stock {
    if (quantity <= 0) throw new Error('Invalid quantity');

    if (this._available < quantity) {
      throw new Error('Not enough stock to reserve');
    }

    return new Stock(this._available - quantity, this._reserved + quantity);
  }

  commit(quantity: number): Stock {
    if (this._reserved < quantity) {
      throw new Error('Not enough reserved stock');
    }

    return new Stock(this._available, this._reserved - quantity);
  }

  release(quantity: number): Stock {
    if (this._reserved < quantity) {
      throw new Error('Invalid release quantity');
    }

    return new Stock(this._available + quantity, this._reserved - quantity);
  }

  increase(quantity: number): Stock {
    if (quantity <= 0) throw new Error('Invalid quantity');

    return new Stock(this._available + quantity, this._reserved);
  }
}
