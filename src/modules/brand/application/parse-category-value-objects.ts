import { BadRequestException } from '@nestjs/common';
import {
  BrandName,
  InvalidBrandNameError,
} from '../domain/value-objects/brand-name.vo';

export function parseBrandName(raw: string): BrandName {
  try {
    return BrandName.create(raw);
  } catch (e) {
    if (e instanceof InvalidBrandNameError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}
