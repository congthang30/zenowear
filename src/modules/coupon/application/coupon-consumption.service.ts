import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { COUPON_REPOSITORY } from './coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from './coupon-usage-repository.token';
import type { ICouponRepository } from '../domain/repositories/coupon.repository.interface';
import type { ICouponUsageRepository } from '../domain/repositories/coupon-usage.repository.interface';

@Injectable()
export class CouponConsumptionService {
  private readonly logger = new Logger(CouponConsumptionService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly usageRepository: ICouponUsageRepository,
  ) {}

  /**
   * Ghi nhận dùng mã sau khi đơn đã tạo. Nếu thất bại cần rollback đơn + kho ở caller.
   */
  async consumeForOrder(
    userId: string,
    couponId: string,
    orderId: string,
  ): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.usageRepository.create(userId, couponId, orderId, session);
        try {
          await this.couponRepository.incrementUsedCount(couponId, session);
        } catch (e) {
          await this.usageRepository.deleteByOrderId(orderId, session);
          throw e instanceof Error ? e : new Error(String(e));
        }
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'COUPON_NO_QUOTA' || (e instanceof Error && e.name === 'COUPON_NO_QUOTA')) {
        throw new BadRequestException('Mã giảm giá vừa hết lượt, vui lòng thử lại');
      }
      this.logger.warn(`Coupon consume failed: ${msg}`);
      throw new BadRequestException(
        'Không thể áp dụng mã giảm giá (có thể đã dùng cho đơn khác hoặc hết lượt)',
      );
    } finally {
      session.endSession();
    }
  }

  async releaseForOrder(orderId: string, couponId: string): Promise<void> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const n = await this.usageRepository.deleteByOrderId(orderId, session);
        if (n > 0) {
          await this.couponRepository.decrementUsedCount(couponId, session);
        }
      });
    } finally {
      session.endSession();
    }
  }
}
