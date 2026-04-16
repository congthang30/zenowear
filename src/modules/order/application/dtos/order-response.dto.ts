import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../domain/enum/order-status.enum';
import { PaymentMethod } from '../../domain/enum/payment-method.enum';
import { PaymentStatus } from '../../domain/enum/payment-status.enum';

export class OrderItemResponseDto {
  @ApiProperty()
  productId!: string;

  @ApiProperty()
  variantId!: string;

  @ApiProperty()
  productName!: string;

  @ApiProperty()
  variantAttributes!: { key: string; value: string }[];

  @ApiProperty()
  price!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  totalPrice!: number;
}

export class ShippingAddressResponseDto {
  @ApiProperty() fullName!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() line1!: string;
  @ApiPropertyOptional() line2?: string;
  @ApiPropertyOptional() district?: string;
  @ApiProperty() city!: string;
  @ApiPropertyOptional() country?: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  discountAmount!: number;

  @ApiProperty()
  finalAmount!: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty({ enum: PaymentMethod, description: 'COD, MOMO hoặc VNPAY' })
  paymentMethod!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @ApiProperty({ type: ShippingAddressResponseDto })
  shippingAddress!: ShippingAddressResponseDto;

  @ApiPropertyOptional({ nullable: true })
  paymentProviderReference?: string | null;

  @ApiPropertyOptional({ description: 'MongoId coupon đã áp dụng' })
  appliedCouponId?: string | null;

  @ApiPropertyOptional()
  appliedCouponCode?: string | null;

  @ApiPropertyOptional()
  createdAt?: string;
}

export class AppliedCouponPreviewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  value!: number;

  @ApiProperty({
    description: 'Mỗi tài khoản tối đa dùng mã cho bao nhiêu đơn thành công',
  })
  usagePerUser!: number;

  @ApiProperty({
    description: 'Ước tính lượt còn lại cho user này (trước đơn đang preview)',
  })
  remainingUsesForUser!: number;
}

export class OrderPreviewResponseDto {
  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  discountAmount!: number;

  @ApiProperty()
  finalAmount!: number;

  @ApiPropertyOptional({ type: AppliedCouponPreviewDto })
  appliedCoupon?: AppliedCouponPreviewDto;
}

export class OnlinePaymentGatewaysResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Mã cổng đang có implementation trên server',
    example: ['MOMO', 'VNPAY'],
  })
  codes!: string[];
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data!: OrderResponseDto[];

  @ApiProperty()
  total!: number;
}
