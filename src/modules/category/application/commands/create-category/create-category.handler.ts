import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from 'src/modules/category/domain/repositories/category.repository';
import { CreateCategoryCommand } from './create-category.command';
import { parseCategoryName } from '../../parse-category-value-objects';
import { Category } from 'src/modules/category/domain/entities/category-credential.entity';

@Injectable()
export class CreateCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<void> {
    const cateName = parseCategoryName(command.categoryName);

    const category = Category.create({
      name: cateName,
      status: command.categoryStatus,
    });

    await this.categoryRepository.create(category);
  }
}
