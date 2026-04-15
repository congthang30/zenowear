import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { ChangeCategoryStatusCommand } from './change-category-status.command';
import { Category } from '../../../domain/entities/category.entity';

@Injectable()
export class ChangeCategoryStatusHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: ChangeCategoryStatusCommand): Promise<void> {
    const cat = await this.categoryRepository.findById(command.id);
    if (!cat || !cat.id) {
      throw new NotFoundException(`Không tìm thấy danh mục: ${command.id}`);
    }

    let parent: Category | null = null;
    if (cat.parentId) {
      parent = await this.categoryRepository.findById(cat.parentId);
    }

    try {
      cat.applyStatus(command.status, { parent });
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    await this.categoryRepository.save(cat);
  }
}
