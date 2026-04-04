import { BadRequestException } from '@nestjs/common';
import {
  CategoryName,
  InvalidCategoryNameError,
} from '../domain/value-objects/category-name.vo';

export function parseCategoryName(raw: string): CategoryName {
  try {
    return CategoryName.create(raw);
  } catch (e) {
    if (e instanceof InvalidCategoryNameError) {
      throw new BadRequestException(e.message);
    }
    throw e;
  }
}
