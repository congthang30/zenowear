/**
 * Value object: email không có identity riêng, hai email cùng chuỗi chuẩn hóa là "cùng một" email.
 * Domain giữ invariant (định dạng + normalize); tầng HTTP vẫn có thể validate lại bằng DTO.
 */
export class InvalidEmailError extends Error {
  constructor(message = 'Invalid email address.') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}

export class Email {
  private constructor(private readonly normalized: string) {}

  static create(raw: string): Email {
    const v = raw.trim().toLowerCase();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      throw new InvalidEmailError();
    }
    return new Email(v);
  }

  get value(): string {
    return this.normalized;
  }

  equals(other: Email): boolean {
    return this.normalized === other.normalized;
  }
}
