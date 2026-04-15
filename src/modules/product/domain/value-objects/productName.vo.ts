export class ProductName {
  private constructor(private readonly normalized: string) {}

  static create(raw: string): ProductName {
    if (!raw || raw.trim().length === 0) {
      throw new InvalidProductNameError('Product name is required');
    }

    const value = raw.trim();

    if (value.length < 2) {
      throw new InvalidProductNameError(
        'Product name must be at least 2 characters',
      );
    }

    if (value.length > 100) {
      throw new InvalidProductNameError(
        'Product name must be less than 100 characters',
      );
    }

    if (!/^[\p{L}\p{N}\s\-]+$/u.test(value)) {
      throw new InvalidProductNameError(
        'Product name contains invalid characters',
      );
    }

    return new ProductName(value.toLowerCase());
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: ProductName): boolean {
    return this.normalized === other.normalized;
  }

  static reconstitute(value: string): ProductName {
    return new ProductName(value);
  }
}

export class InvalidProductNameError extends Error {
  constructor(message = 'Invalid product name.') {
    super(message);
    this.name = 'InvalidProductNameError';
  }
}
