import { Inject, Injectable } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../category-repository.token';
import type { CategoryRepository } from '../../../domain/repositories/category.repository';
import { CategoryResponseDto } from '../../dtos/category-response.dto';

@Injectable()
export class GetActiveCategoriesHandler {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(): Promise<CategoryResponseDto[]> {
    const list = await this.categoryRepository.findAllActive();
    return list.map((c) => CategoryResponseDto.fromEntity(c));
  }
}
