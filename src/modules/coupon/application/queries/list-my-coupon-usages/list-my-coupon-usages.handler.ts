import { Inject, Injectable } from '@nestjs/common';
import { COUPON_REPOSITORY } from '../../coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from '../../coupon-usage-repository.token';
import type { ICouponRepository } from '../../../domain/repositories/coupon.repository.interface';
import type { ICouponUsageRepository } from '../../../domain/repositories/coupon-usage.repository.interface';
import type { CouponUsageHistoryItemDto } from '../../dtos/coupon-usage-history.dto';

@Injectable()
export class ListMyCouponUsagesHandler {
  constructor(
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly usageRepository: ICouponUsageRepository,
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: CouponUsageHistoryItemDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const { data, total } = await this.usageRepository.findByUserId(
      userId,
      skip,
      limit,
    );
    const enriched: CouponUsageHistoryItemDto[] = [];
    for (const row of data) {
      const c = await this.couponRepository.findById(row.couponId);
      enriched.push({
        id: row.id,
        orderId: row.orderId,
        couponId: row.couponId,
        couponCode: c?.code ?? '',
        couponName: c?.name ?? '',
        usedAt: row.usedAt.toISOString(),
      });
    }
    return { data: enriched, total };
  }
}
