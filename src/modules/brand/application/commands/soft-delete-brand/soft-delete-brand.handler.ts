import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { SoftDeleteBrandCommand } from './soft-delete-brand.command';

@Injectable()
export class SoftDeleteBrandHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(command: SoftDeleteBrandCommand): Promise<void> {
    const brand = await this.brandRepository.findById(command.id);
    if (!brand?.id) {
      throw new NotFoundException(`Không tìm thấy thương hiệu: ${command.id}`);
    }
    brand.softDelete();
    await this.brandRepository.save(brand);
  }
}
