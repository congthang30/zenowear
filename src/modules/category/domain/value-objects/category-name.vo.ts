export class CategoryName {
  private constructor(private readonly normalized: string) {}

  static create(raw: string): CategoryName {
    if (!raw || raw.trim().length === 0) {
      throw new InvalidCategoryNameError('Category name is required');
    }

    const value = raw.trim();

    if (value.length < 2) {
      throw new InvalidCategoryNameError(
        'Category name must be at least 2 characters',
      );
    }

    if (value.length > 100) {
      throw new InvalidCategoryNameError(
        'Category name must be less than 100 characters',
      );
    }

    const normalized = value.toLowerCase();
    return new CategoryName(normalized);
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: CategoryName): boolean {
    return this.normalized === other.normalized;
  }
}

export class InvalidCategoryNameError extends Error {
  constructor(message = 'Invalid category name.') {
    super(message);
    this.name = 'InvalidCategoryNameError';
  }
}
