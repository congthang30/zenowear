import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { OrderDocument, OrderSchema } from './infrastructure/persistence/order.orm-entity';
import { OrderRepositoryImpl } from './infrastructure/persistence/order.repository.impl';
import { ORDER_REPOSITORY } from './application/order-repository.token';
import { OrderController } from './presentation/controllers/order.controller';
import { CartModule } from '../cart/cart.module';
import { ProductModule } from '../product/product.module';
import { OrderCheckoutService } from './application/services/order-checkout.service';
import { PreviewOrderHandler } from './application/commands/preview-order/preview-order.handler';
import { CreateOrderFromCartHandler } from './application/commands/create-order-from-cart/create-order-from-cart.handler';
import { GetOrderDetailHandler } from './application/queries/get-order-detail/get-order-detail.handler';
import { GetUserOrdersHandler } from './application/queries/get-user-orders/get-user-orders.handler';
import { CancelOrderHandler } from './application/commands/cancel-order/cancel-order.handler';
import { ChangeOrderStatusHandler } from './application/commands/change-order-status/change-order-status.handler';
import { ConfirmOrderHandler } from './application/commands/confirm-order/confirm-order.handler';
import { PaymentCallbackHandler } from './application/commands/payment-callback/payment-callback.handler';
import { RetryOnlinePaymentHandler } from './application/commands/retry-online-payment/retry-online-payment.handler';
import { ChangeOrderPaymentMethodHandler } from './application/commands/change-order-payment-method/change-order-payment-method.handler';
import { IdentityModule } from '../identity/identity.module';
import { AddressModule } from '../address/address.module';
import { VnpayPaymentStrategy } from './infrastructure/payment/vnpay-payment.strategy';
import { MomoPaymentStrategy } from './infrastructure/payment/momo-payment.strategy';
import { PaymentGatewayRegistry } from './infrastructure/payment/payment-gateway.registry';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderDocument.name, schema: OrderSchema },
    ]),
    AuthJwtModule,
    CartModule,
    ProductModule,
    IdentityModule,
    AddressModule,
    forwardRef(() => CouponModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderRepositoryImpl,
    {
      provide: ORDER_REPOSITORY,
      useExisting: OrderRepositoryImpl,
    },
    OrderCheckoutService,
    PreviewOrderHandler,
    CreateOrderFromCartHandler,
    GetOrderDetailHandler,
    GetUserOrdersHandler,
    CancelOrderHandler,
    ChangeOrderStatusHandler,
    ConfirmOrderHandler,
    PaymentCallbackHandler,
    RetryOnlinePaymentHandler,
    ChangeOrderPaymentMethodHandler,
    VnpayPaymentStrategy,
    MomoPaymentStrategy,
    PaymentGatewayRegistry,
  ],
  exports: [
    ORDER_REPOSITORY,
    MongooseModule,
    OrderCheckoutService,
  ],
})
export class OrderModule {}
