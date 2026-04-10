import { BadRequestException } from '@nestjs/common';
import { Email, InvalidEmailError } from '../domain/value-objects/email.vo';
import {
  FullName,
  InvalidFullNameError,
} from '../../user/domain/value-objects/full-name.vo';
import {
  InvalidPasswordError,
  Password,
} from '../domain/value-objects/password.vo';
import {
  DateOfBirth,
  InvalidDateOfBirthError,
} from '../../user/domain/value-objects/date-of-birth.vo';

export function parseEmail(raw: string): Email {
  try {
    return Email.create(raw);
  } catch (e) {
    if (e instanceof InvalidEmailError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export async function parsePassword(raw: string): Promise<Password> {
  try {
    return await Password.hashFromPlain(raw);
  } catch (e) {
    if (e instanceof InvalidPasswordError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseFullName(raw: string): FullName {
  try {
    return FullName.create(raw);
  } catch (e) {
    if (e instanceof InvalidFullNameError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}

export function parseDateOfBirth(raw: Date): DateOfBirth {
  try {
    return DateOfBirth.create(raw);
  } catch (e) {
    if (e instanceof InvalidDateOfBirthError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}
