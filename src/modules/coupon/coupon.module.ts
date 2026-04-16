import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CartModule } from '../cart/cart.module';
import { OrderModule } from '../order/order.module';
import { CouponDocument, CouponSchema } from './infrastructure/persistence/coupon.orm-entity';
import {
  CouponUsageDocument,
  CouponUsageSchema,
} from './infrastructure/persistence/coupon-usage.orm-entity';
import { CouponRepositoryImpl } from './infrastructure/persistence/coupon.repository.impl';
import { CouponUsageRepositoryImpl } from './infrastructure/persistence/coupon-usage.repository.impl';
import { COUPON_REPOSITORY } from './application/coupon-repository.token';
import { COUPON_USAGE_REPOSITORY } from './application/coupon-usage-repository.token';
import { CouponValidationService } from './application/coupon-validation.service';
import { CouponConsumptionService } from './application/coupon-consumption.service';
import { ListMyCouponUsagesHandler } from './application/queries/list-my-coupon-usages/list-my-coupon-usages.handler';
import { AdminListCouponsHandler } from './application/queries/admin-list-coupons/admin-list-coupons.handler';
import { AdminCreateCouponHandler } from './application/commands/admin-create-coupon/admin-create-coupon.handler';
import { AdminUpdateCouponHandler } from './application/commands/admin-update-coupon/admin-update-coupon.handler';
import { AdminSetCouponStatusHandler } from './application/commands/admin-set-coupon-status/admin-set-coupon-status.handler';
import { ValidateCouponForUserHandler } from './application/quotes/validate-coupon-for-user.handler';
import { CouponAdminController } from './presentation/controllers/coupon-admin.controller';
import { CouponController } from './presentation/controllers/coupon.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CouponDocument.name, schema: CouponSchema },
      { name: CouponUsageDocument.name, schema: CouponUsageSchema },
    ]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('coupon.throttleTtlMs') ?? 60_000,
          limit: config.get<number>('coupon.throttleLimit') ?? 40,
        },
      ],
    }),
    AuthJwtModule,
    CartModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [CouponAdminController, CouponController],
  providers: [
    CouponRepositoryImpl,
    { provide: COUPON_REPOSITORY, useExisting: CouponRepositoryImpl },
    CouponUsageRepositoryImpl,
    { provide: COUPON_USAGE_REPOSITORY, useExisting: CouponUsageRepositoryImpl },
    CouponValidationService,
    CouponConsumptionService,
    AdminCreateCouponHandler,
    AdminUpdateCouponHandler,
    AdminSetCouponStatusHandler,
    ValidateCouponForUserHandler,
    ListMyCouponUsagesHandler,
    AdminListCouponsHandler,
  ],
  exports: [
    COUPON_REPOSITORY,
    COUPON_USAGE_REPOSITORY,
    CouponValidationService,
    CouponConsumptionService,
  ],
})
export class CouponModule {}
