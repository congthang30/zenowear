import { Inject, Injectable } from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../category-repository.token';
import { CreateBrandCommand } from './create-category.command';
import type { BrandRepository } from 'src/modules/brand/domain/repositories/brand.repository';
import { Brand } from 'src/modules/brand/domain/entities/brand.entity';
import { parseBrandName } from '../../parse-category-value-objects';

@Injectable()
export class CreateBrandHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(command: CreateBrandCommand): Promise<void> {
    const brandName = parseBrandName(command.brandName);

    const brand = Brand.create({
      name: brandName,
      status: command.brandStatus,
    });

    await this.brandRepository.create(brand);
  }
}
