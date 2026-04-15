import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { BrandResponseDto } from '../../dtos/brand-response.dto';
import { GetBrandByIdQuery } from './get-brand-by-id.query';
import { BrandStatus } from '../../../domain/enum/brand-status.enum';

@Injectable()
export class GetBrandByIdHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(query: GetBrandByIdQuery): Promise<BrandResponseDto> {
    const brand = await this.brandRepository.findById(query.id);
    if (!brand?.id) {
      throw new NotFoundException(`Không tìm thấy thương hiệu: ${query.id}`);
    }
    if (brand.status !== BrandStatus.ACTIVE) {
      throw new NotFoundException(`Không tìm thấy thương hiệu: ${query.id}`);
    }
    return BrandResponseDto.fromEntity(brand);
  }
}
