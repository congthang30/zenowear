import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { COUPON_REPOSITORY } from '../../coupon-repository.token';
import type {
  CreateCouponInput,
  ICouponRepository,
} from '../../../domain/repositories/coupon.repository.interface';
import { CouponType } from '../../../domain/enum/coupon-type.enum';
import { CouponStatus } from '../../../domain/enum/coupon-status.enum';

@Injectable()
export class AdminCreateCouponHandler {
  constructor(
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(input: CreateCouponInput): Promise<{ id: string }> {
    if (input.endDate <= input.startDate) {
      throw new BadRequestException('endDate phải sau startDate');
    }
    if (input.type === CouponType.PERCENT && (input.value < 1 || input.value > 100)) {
      throw new BadRequestException('PERCENT: value từ 1 đến 100');
    }
    const id = await this.couponRepository.create(input);
    return { id };
  }
}
