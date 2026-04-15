import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { SoftDeleteCategoryCommand } from './soft-delete-category.command';

@Injectable()
export class SoftDeleteCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: SoftDeleteCategoryCommand): Promise<void> {
    const cat = await this.categoryRepository.findById(command.id);
    if (!cat || !cat.id) {
      throw new NotFoundException(`Không tìm thấy danh mục: ${command.id}`);
    }
    cat.softDelete();
    await this.categoryRepository.save(cat);
  }
}
