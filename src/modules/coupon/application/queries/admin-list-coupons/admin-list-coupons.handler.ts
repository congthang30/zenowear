import { Inject, Injectable } from '@nestjs/common';
import { COUPON_REPOSITORY } from '../../coupon-repository.token';
import type { ICouponRepository, CouponReadModel } from '../../../domain/repositories/coupon.repository.interface';

@Injectable()
export class AdminListCouponsHandler {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
  ): Promise<{ data: CouponReadModel[]; total: number }> {
    return this.couponRepository.findAll(page, limit);
  }
}
