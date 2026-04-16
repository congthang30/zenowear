import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COUPON_REPOSITORY } from '../../coupon-repository.token';
import type { ICouponRepository } from '../../../domain/repositories/coupon.repository.interface';
import type { CouponStatus } from '../../../domain/enum/coupon-status.enum';

@Injectable()
export class AdminSetCouponStatusHandler {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(id: string, status: CouponStatus): Promise<void> {
    const cur = await this.couponRepository.findById(id);
    if (!cur) throw new NotFoundException('Coupon không tồn tại');
    await this.couponRepository.setStatus(id, status);
  }
}
