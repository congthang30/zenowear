export class InvalidFullNameError extends Error {
  constructor(message = 'The name is invalid.') {
    super(message);
    this.name = 'InvalidFullNameError';
  }
}

export class FullName {
  private constructor(readonly value: string) {}

  static create(raw: string): FullName {
    const v = raw.trim().replace(/\s+/g, ' ');
    if (v.length < 1 || v.length > 200) {
      throw new InvalidFullNameError();
    }
    return new FullName(v);
  }
}
