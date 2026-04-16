import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { COUPON_REPOSITORY } from './coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from './coupon-usage-repository.token';
import type { ICouponRepository } from '../domain/repositories/coupon.repository.interface';
import type { ICouponUsageRepository } from '../domain/repositories/coupon-usage.repository.interface';
import { CouponValidationService } from './coupon-validation.service';
import { hashClientIpForCoupon } from './coupon-ip-hash.util';

function unwrapCause(e: unknown): unknown {
  if (e && typeof e === 'object' && 'cause' in e) {
    const c = (e as { cause?: unknown }).cause;
    if (c !== undefined && c !== e) {
      return unwrapCause(c);
    }
  }
  return e;
}

function isCouponNoQuota(e: unknown): boolean {
  const x = unwrapCause(e);
  if (x instanceof Error && x.name === 'COUPON_NO_QUOTA') {
    return true;
  }
  if (x instanceof Error && x.message === 'COUPON_NO_QUOTA') {
    return true;
  }
  return false;
}

function isMongoDuplicateKey(e: unknown): boolean {
  const x = unwrapCause(e);
  return (
    typeof x === 'object' &&
    x !== null &&
    (x as { code?: number }).code === 11000
  );
}

@Injectable()
export class CouponConsumptionService {
  private readonly logger = new Logger(CouponConsumptionService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
    @Inject(COUPON_USAGE_REPOSITORY)
    private readonly usageRepository: ICouponUsageRepository,
    private readonly config: ConfigService,
    private readonly couponValidation: CouponValidationService,
  ) {}

  /**
   * Ghi nhận dùng mã sau khi đơn đã tạo. Nếu thất bại cần rollback đơn + kho ở caller.
   */
  async consumeForOrder(
    userId: string,
    couponId: string,
    orderId: string,
    clientIp?: string | null,
  ): Promise<void> {
    await this.couponValidation.assertSameIpUserQuota(userId, couponId, clientIp);
    const salt = String(this.config.get<string>('coupon.ipHashSalt') ?? '');
    const ipHash = hashClientIpForCoupon(String(clientIp ?? ''), salt);

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.usageRepository.create(
          userId,
          couponId,
          orderId,
          session,
          ipHash,
        );
        try {
          await this.couponRepository.incrementUsedCount(couponId, session);
        } catch (e) {
          await this.usageRepository.deleteByOrderId(orderId, session);
          throw e instanceof Error ? e : new Error(String(e));
        }
      });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      if (isCouponNoQuota(e)) {
        throw new BadRequestException(
          'Mã giảm giá hiện không còn lượt hoặc không còn khả dụng. Bạn có thể bỏ mã hoặc chọn mã khác rồi đặt hàng lại.',
        );
      }
      if (isMongoDuplicateKey(e)) {
        throw new BadRequestException(
          'Không thể ghi nhận mã giảm giá cho đơn này (trùng dữ liệu). Vui lòng tải lại trang và đặt hàng lại.',
        );
      }
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Coupon consume failed: ${msg}`);
      throw new BadRequestException(
        'Hiện không thể áp dụng mã giảm giá cho đơn hàng (mã có thể vừa hết lượt, hết hạn hoặc không đủ điều kiện). Hãy bỏ mã hoặc thử mã khác.',
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
