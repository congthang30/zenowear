import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { UpdateBrandCommand } from './update-brand.command';
import { parseBrandName } from '../../parse-brand-value-objects';

@Injectable()
export class UpdateBrandHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(command: UpdateBrandCommand): Promise<void> {
    const brand = await this.brandRepository.findById(command.id);
    if (!brand?.id) {
      throw new NotFoundException(`Không tìm thấy thương hiệu: ${command.id}`);
    }

    if (command.name !== undefined) {
      const nameVo = parseBrandName(command.name);
      const dup = await this.brandRepository.findByNormalizedName(nameVo.value);
      if (dup && dup.id !== brand.id) {
        throw new ConflictException('Tên thương hiệu đã tồn tại');
      }
      brand.updateDetails({ name: nameVo });
    }

    if (command.logo !== undefined) {
      brand.updateDetails({ logo: command.logo });
    }
    if (command.description !== undefined) {
      brand.updateDetails({ description: command.description });
    }

    await this.brandRepository.save(brand);
  }
}
