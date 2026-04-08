export class Barcode {
  private constructor(private readonly normalized: string) {}

  static create(raw: string): Barcode {
    if (!raw) {
      throw new InvalidBarcodeError('Barcode is required');
    }

    const normalized = raw.trim();

    if (normalized.length > 14 || normalized.length < 8) {
      throw new InvalidBarcodeError(
        'The barcode must be between 8 and 14 characters long.',
      );
    }

    if (!/^\d+$/.test(normalized)) {
      throw new InvalidBarcodeError('Barcode must contain only digits (0-9).');
    }

    return new Barcode(normalized);
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: Barcode): boolean {
    return this.normalized === other.normalized;
  }
}

export class InvalidBarcodeError extends Error {
  constructor(message = 'Invalid barcode.') {
    super(message);
    this.name = 'InvalidBarcodeError';
  }
}
