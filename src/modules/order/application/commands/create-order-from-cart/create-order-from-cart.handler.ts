import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { CART_REPOSITORY } from '../../../../cart/application/cart-repository.token';
import type { ICartRepository } from '../../../../cart/domain/repositories/cart.repository.interface';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { OrderCheckoutService } from '../../services/order-checkout.service';
import { CreateOrderFromCartCommand } from './create-order-from-cart.command';
import { Order } from '../../../domain/entities/order.entity';
import {
  PaymentMethod,
  isOnlinePaymentMethod,
} from '../../../domain/enum/payment-method.enum';
import { MailService } from '../../../../../common/mail/mail.service';
import { PaymentGatewayRegistry } from '../../../infrastructure/payment/payment-gateway.registry';
import { ADDRESS_REPOSITORY } from '../../../../address/application/address-repository.token';
import type { IAddressRepository } from '../../../../address/domain/repositories/address.repository.interface';
import type { ShippingAddress } from '../../../domain/entities/order.entity';
import { CouponValidationService } from '../../../../coupon/application/coupon-validation.service';
import { CouponConsumptionService } from '../../../../coupon/application/coupon-consumption.service';

@Injectable()
export class CreateOrderFromCartHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    private readonly checkout: OrderCheckoutService,
    private readonly mailService: MailService,
    private readonly paymentGateways: PaymentGatewayRegistry,
    private readonly couponValidation: CouponValidationService,
    private readonly couponConsumption: CouponConsumptionService,
  ) {}

  async execute(
    command: CreateOrderFromCartCommand,
  ): Promise<{ id: string; message: string; paymentRedirectUrl?: string }> {
    const cart = await this.cartRepository.findByUserId(command.userId);
    if (!cart?.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    if (isOnlinePaymentMethod(command.paymentMethod)) {
      if (!command.returnUrl) {
        throw new BadRequestException(
          'Đơn MOMO/VNPAY cần returnUrl',
        );
      }
    }

    const hasAddrId =
      typeof command.addressId === 'string' &&
      command.addressId.trim().length > 0;
    const hasShip = command.shippingAddress != null;
    if (hasAddrId === hasShip) {
      throw new BadRequestException(
        'Gửi đúng một trong hai: addressId hoặc shippingAddress',
      );
    }

    const snapshots = await this.checkout.buildSnapshotsFromCart(cart);

    let shipping: ShippingAddress;
    if (command.addressId) {
      const saved = await this.addressRepository.findByIdAndUserId(
        command.addressId,
        command.userId,
      );
      if (!saved) {
        throw new BadRequestException(
          'Địa chỉ không tồn tại hoặc không thuộc tài khoản',
        );
      }
      shipping = saved.toSnapshot();
    } else if (command.shippingAddress) {
      shipping = command.shippingAddress;
    } else {
      throw new BadRequestException('Cần addressId hoặc shippingAddress');
    }

    const totalAmount = snapshots.reduce((s, i) => s + i.totalPrice, 0);
    let discountAmount = command.discountAmount ?? 0;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;
    if (command.couponCode?.trim()) {
      const q = await this.couponValidation.evaluateForSubtotal(
        command.userId,
        command.couponCode,
        totalAmount,
        command.couponAntiAbuseClientIp,
      );
      discountAmount = q.discountAmount;
      appliedCouponId = q.couponId;
      appliedCouponCode = q.appliedCoupon.code;
    } else if (discountAmount > totalAmount) {
      throw new BadRequestException('Giảm giá không được vượt tổng tiền hàng');
    }
    if (discountAmount > totalAmount) {
      throw new BadRequestException('Giảm giá không được vượt tổng tiền hàng');
    }

    const order = Order.createNew({
      userId: command.userId,
      items: snapshots,
      discountAmount,
      paymentMethod: command.paymentMethod,
      shippingAddress: shipping,
      appliedCouponId,
      appliedCouponCode,
    });

    await this.checkout.decrementStocks(snapshots);
    let orderId: string | undefined;
    try {
      orderId = await this.orderRepository.create(order);
      if (appliedCouponId) {
        await this.couponConsumption.consumeForOrder(
          command.userId,
          appliedCouponId,
          orderId,
          command.couponAntiAbuseClientIp,
        );
      }
      cart.clearItems();
      await this.cartRepository.save(cart);

      const identity = await this.identityRepository.findByIdUser(
        command.userId,
      );
      if (identity && command.paymentMethod === PaymentMethod.COD) {
        await this.mailService.sendOrderConfirmation(identity.email.value, {
          orderId: orderId,
          finalAmount: order.finalAmount,
          paymentMethod: command.paymentMethod,
          stage: 'placed',
        });
      }

      let paymentRedirectUrl: string | undefined;
      if (
        isOnlinePaymentMethod(command.paymentMethod) &&
        command.returnUrl
      ) {
        const strategy = this.paymentGateways.get(command.paymentMethod);
        const { redirectUrl } = await strategy.buildPaymentUrl({
          orderId: orderId,
          amount: order.finalAmount,
          orderDescription: `Thanh toan don hang ${orderId}`,
          returnUrl: command.returnUrl,
          ipnUrl: command.ipnUrl,
          clientIp: command.clientIp,
        });
        paymentRedirectUrl = redirectUrl;
      }

      return {
        id: orderId,
        message: 'Đặt hàng thành công.',
        paymentRedirectUrl,
      };
    } catch (e) {
      if (orderId) {
        if (appliedCouponId) {
          await this.couponConsumption.releaseForOrder(orderId, appliedCouponId);
        }
        await this.orderRepository.deleteById(orderId);
      }
      await this.checkout.incrementStocks(snapshots);
      throw e;
    }
  }
}
