import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { COUPON_REPOSITORY } from '../../coupon-repository.token';
import type {
  ICouponRepository,
  UpdateCouponInput,
} from '../../../domain/repositories/coupon.repository.interface';

@Injectable()
export class AdminUpdateCouponHandler {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(id: string, patch: UpdateCouponInput): Promise<void> {
    const cur = await this.couponRepository.findById(id);
    if (!cur) throw new NotFoundException('Coupon không tồn tại');
    const start = patch.startDate ?? cur.startDate;
    const end = patch.endDate ?? cur.endDate;
    if (end <= start) {
      throw new BadRequestException('endDate phải sau startDate');
    }
    await this.couponRepository.update(id, patch);
  }
}
