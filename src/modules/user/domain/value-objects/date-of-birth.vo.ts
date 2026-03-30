export class InvalidDateOfBirthError extends Error {
  constructor(message = 'Invalid date of birth') {
    super(message);
    this.name = 'InvalidDateOfBirthError';
  }
}

export class DateOfBirth {
  private constructor(readonly _value: Date) {}

  static create(raw: Date): DateOfBirth {
    if (!raw) {
      throw new Error('Date of birth is required');
    }

    const date = new Date(raw);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date of birth format');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    date.setHours(0, 0, 0, 0);

    if (date >= today) {
      throw new InvalidDateOfBirthError('Date of birth must be in the past');
    }

    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      throw new InvalidDateOfBirthError('User must be at least 18 years old');
    }

    return new DateOfBirth(date);
  }

  get value(): Date {
    return this._value;
  }
}
