import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { ChangeBrandStatusCommand } from './change-brand-status.command';

@Injectable()
export class ChangeBrandStatusHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(command: ChangeBrandStatusCommand): Promise<void> {
    const brand = await this.brandRepository.findById(command.id);
    if (!brand?.id) {
      throw new NotFoundException(`Không tìm thấy thương hiệu: ${command.id}`);
    }
    brand.applyStatus(command.status);
    await this.brandRepository.save(brand);
  }
}
