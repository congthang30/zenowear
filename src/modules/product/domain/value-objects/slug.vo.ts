export class Slug {
  private constructor(private readonly _value: string) {}

  static create(input: string): Slug {
    if (!input) {
      throw new InvalidSlugError('Slug is required');
    }

    const normalized = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!normalized) {
      throw new InvalidSlugError('Invalid slug');
    }

    return new Slug(normalized);
  }

  static reconstitute(value: string): Slug {
    return new Slug(value);
  }

  get value(): string {
    return this._value;
  }
}

export class InvalidSlugError extends Error {
  constructor(message = 'Invalid slug.') {
    super(message);
    this.name = 'InvalidSlugError';
  }
}
