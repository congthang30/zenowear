import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CategoryResponseDto } from '../../dtos/category-response.dto';
import { GetCategoryByIdQuery } from './get-category-by-id.query';
import { CategoryStatus } from '../../../domain/enum/category-status.enum';

@Injectable()
export class GetCategoryByIdHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(query: GetCategoryByIdQuery): Promise<CategoryResponseDto> {
    const cat = await this.categoryRepository.findById(query.id);
    if (!cat?.id) {
      throw new NotFoundException(`Không tìm thấy danh mục: ${query.id}`);
    }
    if (cat.status !== CategoryStatus.ACTIVE) {
      throw new NotFoundException(`Không tìm thấy danh mục: ${query.id}`);
    }
    return CategoryResponseDto.fromEntity(cat);
  }
}
