import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { UpdateCategoryCommand } from './update-category.command';
import { parseCategoryName } from '../../parse-category-value-objects';
import { CategoryStatus } from '../../../domain/enum/category-status.enum';

@Injectable()
export class UpdateCategoryHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  private async assertNoParentCycle(
    categoryId: string,
    newParentId: string | null,
  ): Promise<void> {
    if (!newParentId) return;
    let current: string | null = newParentId;
    while (current) {
      if (current === categoryId) {
        throw new BadRequestException('Không thể đặt cha tạo chu trình (cycle)');
      }
      const node = await this.categoryRepository.findById(current);
      if (!node) break;
      current = node.parentId;
    }
  }

  async execute(command: UpdateCategoryCommand): Promise<void> {
    const cat = await this.categoryRepository.findById(command.id);
    if (!cat || !cat.id) {
      throw new NotFoundException(`Không tìm thấy danh mục: ${command.id}`);
    }

    if (command.parentId !== undefined) {
      await this.assertNoParentCycle(cat.id, command.parentId);
      if (command.parentId) {
        const p = await this.categoryRepository.findById(command.parentId);
        if (!p) {
          throw new NotFoundException(
            `Không tìm thấy danh mục cha: ${command.parentId}`,
          );
        }
        if (
          cat.status === CategoryStatus.ACTIVE &&
          p.status !== CategoryStatus.ACTIVE
        ) {
          throw new BadRequestException(
            'Danh mục đang ACTIVE: cha mới phải đang ACTIVE',
          );
        }
      }
    }

    try {
      if (command.name !== undefined) {
        cat.updateDetails({ name: parseCategoryName(command.name) });
      }
      if (command.parentId !== undefined) {
        cat.updateDetails({ parentId: command.parentId });
      }
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }

    await this.categoryRepository.save(cat);
  }
}
