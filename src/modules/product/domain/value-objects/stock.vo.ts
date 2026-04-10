export class Stock {
  private constructor(
    private readonly _available: number,
    private readonly _reserved: number,
  ) {}

  static create(available: number, reserved: number = 0): Stock {
    if (available < 0 || reserved < 0) {
      throw new Error('Stock cannot be negative');
    }
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

  //giữ hàng khi có người đang oder để tránh bán quá sl tồn kho
  reserve(quantity: number): Stock {
    if (quantity <= 0) throw new Error('Invalid quantity');

    if (this._available < quantity) {
      throw new Error('Not enough stock to reserve');
    }

    return new Stock(this._available - quantity, this._reserved + quantity);
  }

  //xác nhận order trừ thẳng vào
  commit(quantity: number): Stock {
    if (this._reserved < quantity) {
      throw new Error('Not enough reserved stock');
    }

    return new Stock(this._available, this._reserved - quantity);
  }

  //rollback khi người dùng hủy thanh toán hay một vấn đề nào đó
  release(quantity: number): Stock {
    if (this._reserved < quantity) {
      throw new Error('Invalid release quantity');
    }

    return new Stock(this._available + quantity, this._reserved - quantity);
  }

  //nhập kho
  increase(quantity: number): Stock {
    if (quantity <= 0) throw new Error('Invalid quantity');

    return new Stock(this._available + quantity, this._reserved);
  }
}
