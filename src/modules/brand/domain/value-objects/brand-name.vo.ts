export class BrandName {
  private constructor(private readonly normalized: string) {}

  static create(raw: string): BrandName {
    if (!raw || raw.trim().length === 0) {
      throw new InvalidBrandNameError('Brand name is required');
    }

    const value = raw.trim();

    if (value.length < 2) {
      throw new InvalidBrandNameError(
        'Brand name must be at least 2 characters',
      );
    }

    if (value.length > 100) {
      throw new InvalidBrandNameError(
        'Brand name must be less than 100 characters',
      );
    }

    const normalized = value.toLowerCase().normalize('NFC');

    return new BrandName(normalized);
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: BrandName): boolean {
    return this.normalized === other.normalized;
  }
}

export class InvalidBrandNameError extends Error {
  constructor(message = 'Invalid brand name.') {
    super(message);
    this.name = 'InvalidBrandNameError';
  }
}
