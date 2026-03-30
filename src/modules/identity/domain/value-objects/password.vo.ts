import * as bcrypt from 'bcrypt';

export class Password {
  private constructor(private readonly _value: string) {}

  static async hashFromPlain(raw: string): Promise<Password> {
    if (raw.length < 8) {
      throw new InvalidPasswordError(
        'Password must be at least 8 characters long',
      );
    }

    if (!/[A-Z]/.test(raw)) {
      throw new InvalidPasswordError(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/[a-z]/.test(raw)) {
      throw new InvalidPasswordError(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!/[0-9]/.test(raw)) {
      throw new InvalidPasswordError(
        'Password must contain at least one number',
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(raw)) {
      throw new InvalidPasswordError(
        'Password must contain at least one special character',
      );
    }

    const hashed = await bcrypt.hash(raw, 12);

    return new Password(hashed);
  }

  static create(raw: string): Promise<Password> {
    return Password.hashFromPlain(raw);
  }

  static fromHash(storedHash: string): Password {
    if (!storedHash?.length) {
      throw new InvalidPasswordError('Invalid stored password hash');
    }
    return new Password(storedHash);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Password): boolean {
    return this.value === other.value;
  }

  async compare(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this._value);
  }
}

export class InvalidPasswordError extends Error {
  constructor(message = 'Invalid Password') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}
