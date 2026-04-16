import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from '../../order-repository.token';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { PaymentCallbackCommand } from './payment-callback.command';
import { PaymentCallbackOutcome } from '../../dtos/payment-callback.dto';
import {
  isOnlinePaymentMethod,
} from '../../../domain/enum/payment-method.enum';
import { PaymentStatus } from '../../../domain/enum/payment-status.enum';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { MailService } from '../../../../../common/mail/mail.service';
import { parseInternalOrderIdFromGatewayMerchantOrderId } from '../../../infrastructure/payment/gateway-merchant-order-id';

@Injectable()
export class PaymentCallbackHandler {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: PaymentCallbackCommand): Promise<void> {
    const internalOrderId = parseInternalOrderIdFromGatewayMerchantOrderId(
      command.orderId,
    );
    if (!internalOrderId) {
      throw new BadRequestException(
        'orderId không hợp lệ (MongoId hoặc mã từ cổng dạng {MongoId}__{timestamp})',
      );
    }
    const order = await this.orderRepository.findById(internalOrderId);
    if (!order?.id) {
      throw new NotFoundException(`Không tìm thấy đơn: ${internalOrderId}`);
    }

    if (!isOnlinePaymentMethod(order.paymentMethod)) {
      throw new BadRequestException('Callback chỉ áp dụng đơn MOMO/VNPAY');
    }

    const ref = command.gatewayReference;
    const other = await this.orderRepository.findByPaymentReference(ref);
    if (other && other.id !== order.id) {
      throw new ConflictException('gatewayReference đã gắn đơn khác');
    }

    if (order.paymentProviderReference === ref) {
      return;
    }

    if (command.outcome === PaymentCallbackOutcome.PAID) {
      if (order.paymentStatus === PaymentStatus.PAID) {
        return;
      }
      if (order.paymentStatus === PaymentStatus.FAILED) {
        throw new ConflictException('Đơn đã thanh toán thất bại, không thể PAID');
      }
      order.applyOnlinePaymentSuccess(ref);
      await this.orderRepository.save(order);

      const identity = await this.identityRepository.findByIdUser(
        order.userId,
      );
      if (identity) {
        await this.mailService.sendOrderConfirmation(identity.email.value, {
          orderId: order.id!,
          finalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          stage: 'paid',
        });
      }
      return;
    } else {
      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new ConflictException('Đơn đã PAID, không nhận FAILED');
      }
      order.applyOnlinePaymentFailed(ref);
    }

    await this.orderRepository.save(order);
  }
}
