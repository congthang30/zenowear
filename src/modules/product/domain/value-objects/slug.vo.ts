export class Slug {
  private constructor(private readonly _value: string) {}

  static create(input: string): Slug {
    if (!input) throw new Error('Slug is required');

    const normalized = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!normalized) {
      throw new Error('Invalid slug');
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
