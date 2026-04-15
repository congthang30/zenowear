import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { CreateBrandCommand } from './create-brand.command';
import { parseBrandName } from '../../parse-brand-value-objects';
import { Brand } from '../../../domain/entities/brand.entity';
import { BrandStatus } from '../../../domain/enum/brand-status.enum';

@Injectable()
export class CreateBrandHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(command: CreateBrandCommand): Promise<string> {
    const nameVo = parseBrandName(command.name);
    const existing = await this.brandRepository.findByNormalizedName(
      nameVo.value,
    );
    if (existing) {
      throw new ConflictException('Tên thương hiệu đã tồn tại');
    }

    const brand = Brand.create({
      name: nameVo,
      logo: command.logo ?? null,
      description: command.description ?? null,
      status: command.status ?? BrandStatus.DRAFT,
    });

    return this.brandRepository.create(brand);
  }
}
