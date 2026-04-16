import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../../../../common/strategies/jwt.strategy';

import { PreviewOrderHandler } from '../../application/commands/preview-order/preview-order.handler';
import { PreviewOrderCommand } from '../../application/commands/preview-order/preview-order.command';
import { CreateOrderFromCartHandler } from '../../application/commands/create-order-from-cart/create-order-from-cart.handler';
import { CreateOrderFromCartCommand } from '../../application/commands/create-order-from-cart/create-order-from-cart.command';
import { CancelOrderHandler } from '../../application/commands/cancel-order/cancel-order.handler';
import { CancelOrderCommand } from '../../application/commands/cancel-order/cancel-order.command';
import { ChangeOrderStatusHandler } from '../../application/commands/change-order-status/change-order-status.handler';
import { ChangeOrderStatusCommand } from '../../application/commands/change-order-status/change-order-status.command';
import { ConfirmOrderHandler } from '../../application/commands/confirm-order/confirm-order.handler';
import { ConfirmOrderCommand } from '../../application/commands/confirm-order/confirm-order.command';
import { PaymentCallbackHandler } from '../../application/commands/payment-callback/payment-callback.handler';
import { PaymentCallbackCommand } from '../../application/commands/payment-callback/payment-callback.command';

import { GetOrderDetailHandler } from '../../application/queries/get-order-detail/get-order-detail.handler';
import { GetOrderDetailQuery } from '../../application/queries/get-order-detail/get-order-detail.query';
import { GetUserOrdersHandler } from '../../application/queries/get-user-orders/get-user-orders.handler';
import { GetUserOrdersQuery } from '../../application/queries/get-user-orders/get-user-orders.query';

import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { PreviewOrderDto } from '../../application/dtos/preview-order.dto';
import {
  OnlinePaymentGatewaysResponseDto,
  OrderPreviewResponseDto,
  OrderResponseDto,
  PaginatedOrdersResponseDto,
} from '../../application/dtos/order-response.dto';
import { ChangeOrderStatusDto } from '../../application/dtos/change-order-status.dto';
import {
  PaymentCallbackDto,
  PaymentCallbackOutcome,
} from '../../application/dtos/payment-callback.dto';
import { CreateOrderResponseDto } from '../../application/dtos/create-order-response.dto';
import { RetryOnlinePaymentDto } from '../../application/dtos/retry-online-payment.dto';
import { ChangeOrderPaymentMethodDto } from '../../application/dtos/change-order-payment-method.dto';
import { AdjustOrderPaymentResponseDto } from '../../application/dtos/adjust-order-payment-response.dto';
import { RetryOnlinePaymentHandler } from '../../application/commands/retry-online-payment/retry-online-payment.handler';
import { RetryOnlinePaymentCommand } from '../../application/commands/retry-online-payment/retry-online-payment.command';
import { ChangeOrderPaymentMethodHandler } from '../../application/commands/change-order-payment-method/change-order-payment-method.handler';
import { ChangeOrderPaymentMethodCommand } from '../../application/commands/change-order-payment-method/change-order-payment-method.command';
import { PaymentGatewayRegistry } from '../../infrastructure/payment/payment-gateway.registry';

function isAdmin(user: JwtAccessPayload): boolean {
  return String(user.role).toUpperCase() === 'ADMIN';
}

@ApiTags('Order')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly previewOrderHandler: PreviewOrderHandler,
    private readonly createOrderFromCartHandler: CreateOrderFromCartHandler,
    private readonly getOrderDetailHandler: GetOrderDetailHandler,
    private readonly getUserOrdersHandler: GetUserOrdersHandler,
    private readonly cancelOrderHandler: CancelOrderHandler,
    private readonly changeOrderStatusHandler: ChangeOrderStatusHandler,
    private readonly confirmOrderHandler: ConfirmOrderHandler,
    private readonly paymentCallbackHandler: PaymentCallbackHandler,
    private readonly retryOnlinePaymentHandler: RetryOnlinePaymentHandler,
    private readonly changeOrderPaymentMethodHandler: ChangeOrderPaymentMethodHandler,
    private readonly paymentGatewayRegistry: PaymentGatewayRegistry,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      '8–9. Tính tổng đơn + kiểm tra tồn kho (không tạo đơn, không trừ kho)',
  })
  @ApiBody({ type: PreviewOrderDto })
  @ApiResponse({ status: HttpStatus.OK, type: OrderPreviewResponseDto })
  preview(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: PreviewOrderDto,
  ): Promise<OrderPreviewResponseDto> {
    return this.previewOrderHandler.execute(
      new PreviewOrderCommand(
        user.userId,
        body.discountAmount,
        body.couponCode,
      ),
    );
  }

  @Post('payment/callback')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '7. Callback cổng thanh toán (idempotent theo gatewayReference)' })
  @ApiHeader({
    name: 'x-webhook-secret',
    required: false,
    description: 'Khớp env PAYMENT_WEBHOOK_SECRET nếu có cấu hình',
  })
  @ApiBody({ type: PaymentCallbackDto })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async paymentCallback(
    @Headers('x-webhook-secret') secret: string | undefined,
    @Body() body: PaymentCallbackDto,
  ): Promise<void> {
    const expected = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Webhook secret không hợp lệ');
    }
    await this.paymentCallbackHandler.execute(
      new PaymentCallbackCommand(
        body.orderId,
        body.gatewayReference,
        body.status as PaymentCallbackOutcome,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: '1. Tạo đơn từ giỏ (trừ kho, xóa dòng giỏ)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateOrderResponseDto })
  async create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() body: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    const shipping =
      body.shippingAddress != null
        ? {
            fullName: body.shippingAddress.fullName,
            phone: body.shippingAddress.phone,
            line1: body.shippingAddress.line1,
            line2: body.shippingAddress.line2,
            district: body.shippingAddress.district,
            city: body.shippingAddress.city,
            country: body.shippingAddress.country ?? 'VN',
          }
        : undefined;

    return this.createOrderFromCartHandler.execute(
      new CreateOrderFromCartCommand(
        user.userId,
        body.paymentMethod,
        shipping,
        body.addressId,
        body.discountAmount,
        body.returnUrl,
        body.clientIp,
        body.ipnUrl,
        body.couponCode,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/retry-online-payment')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Điều chỉnh thanh toán trong 24h (PENDING, chưa PAID): thanh toán lại cùng cổng, hoặc gửi paymentMethod để đổi COD/MOMO/VNPAY; MOMO/VNPAY cần returnUrl.',
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: RetryOnlinePaymentDto })
  @ApiResponse({ status: HttpStatus.OK, type: AdjustOrderPaymentResponseDto })
  retryOnlinePayment(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() body: RetryOnlinePaymentDto,
  ): Promise<AdjustOrderPaymentResponseDto> {
    return this.retryOnlinePaymentHandler.execute(
      new RetryOnlinePaymentCommand(
        user.userId,
        id,
        body.returnUrl,
        body.paymentMethod,
        body.clientIp,
        body.ipnUrl,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Đổi COD ↔ MOMO ↔ VNPAY (đơn PENDING, chưa PAID, trong 24h). Sang MOMO/VNPAY trả paymentRedirectUrl.',
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: ChangeOrderPaymentMethodDto })
  @ApiResponse({ status: HttpStatus.OK, type: AdjustOrderPaymentResponseDto })
  changePaymentMethod(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() body: ChangeOrderPaymentMethodDto,
  ): Promise<AdjustOrderPaymentResponseDto> {
    return this.changeOrderPaymentMethodHandler.execute(
      new ChangeOrderPaymentMethodCommand(
        user.userId,
        id,
        body.paymentMethod,
        body.returnUrl,
        body.clientIp,
        body.ipnUrl,
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('online-payment-gateways')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Danh sách mã cổng đang bật (trùng giá trị paymentMethod MOMO/VNPAY khi tạo đơn)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: OnlinePaymentGatewaysResponseDto })
  listOnlinePaymentGateways(): OnlinePaymentGatewaysResponseDto {
    return { codes: this.paymentGatewayRegistry.supportedCodes() };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '3. Đơn hàng của tôi (phân trang)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedOrdersResponseDto })
  listMine(
    @CurrentUser() user: JwtAccessPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.getUserOrdersHandler.execute(
      new GetUserOrdersQuery(user.userId, Number(page) || 1, Number(limit) || 10),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '2. Chi tiết đơn (chủ đơn hoặc ADMIN)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: OrderResponseDto })
  getDetail(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.getOrderDetailHandler.execute(
      new GetOrderDetailQuery(id, user.userId, isAdmin(user)),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '4. Hủy đơn (không hủy khi SHIPPING/DELIVERED)' })
  @ApiParam({ name: 'id' })
  async cancel(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.cancelOrderHandler.execute(
      new CancelOrderCommand(user.userId, id),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      '5. Admin đổi trạng thái (PENDING→CONFIRMED|CANCELLED, CONFIRMED→SHIPPING|CANCELLED, SHIPPING→DELIVERED)',
  })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: ChangeOrderStatusDto })
  async changeStatus(
    @Param('id') id: string,
    @Body() body: ChangeOrderStatusDto,
  ): Promise<void> {
    await this.changeOrderStatusHandler.execute(
      new ChangeOrderStatusCommand(id, body.status),
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: '6. Admin xác nhận đơn (PENDING → CONFIRMED)' })
  @ApiParam({ name: 'id' })
  async confirm(@Param('id') id: string): Promise<void> {
    await this.confirmOrderHandler.execute(new ConfirmOrderCommand(id));
  }
}
