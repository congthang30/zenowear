import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CreateCategoryCommand } from './create-category.command';
import { parseCategoryName } from '../../parse-category-value-objects';
import { Category } from '../../../domain/entities/category.entity';
import { CategoryStatus } from '../../../domain/enum/category-status.enum';

@Injectable()
export class CreateCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<string> {
    const status = command.status ?? CategoryStatus.DRAFT;
    let parent = null as Awaited<
      ReturnType<CategoryRepository['findById']>
    > | null;

    if (command.parentId) {
      parent = await this.categoryRepository.findById(command.parentId);
      if (!parent) {
        throw new NotFoundException(
          `Không tìm thấy danh mục cha: ${command.parentId}`,
        );
      }
      if (
        status === CategoryStatus.ACTIVE &&
        parent.status !== CategoryStatus.ACTIVE
      ) {
        throw new BadRequestException(
          'Không thể tạo ACTIVE: danh mục cha phải đang ACTIVE',
        );
      }
    }

    const cateName = parseCategoryName(command.name);
    const category = Category.create({
      name: cateName,
      parentId: command.parentId ?? null,
      status,
    });

    return this.categoryRepository.create(category);
  }
}
