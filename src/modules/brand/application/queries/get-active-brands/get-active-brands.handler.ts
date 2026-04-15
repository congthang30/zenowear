import { Inject, Injectable } from '@nestjs/common';
import { BRAND_REPOSITORY } from '../../brand-repository.token';
import type { BrandRepository } from '../../../domain/repositories/brand.repository';
import { BrandResponseDto } from '../../dtos/brand-response.dto';

@Injectable()
export class GetActiveBrandsHandler {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: BrandRepository,
  ) {}

  async execute(): Promise<BrandResponseDto[]> {
    const list = await this.brandRepository.findAllActive();
    return list.map((b) => BrandResponseDto.fromEntity(b));
  }
}
