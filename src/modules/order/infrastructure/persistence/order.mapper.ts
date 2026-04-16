import {
  Order,
  type OrderItemSnapshot,
  type ShippingAddress,
} from '../../domain/entities/order.entity';
import { PaymentMethod } from '../../domain/enum/payment-method.enum';
import { OrderDocument } from './order.orm-entity';

/** Đọc đơn cũ: paymentMethod=ONLINE + onlinePaymentGateway → MOMO/VNPAY */
export type OrderDocumentWithLegacy = OrderDocument & {
  onlinePaymentGateway?: string | null;
};

export function paymentMethodFromOrderDocument(
  doc: OrderDocumentWithLegacy,
): PaymentMethod {
  const raw = String(doc.paymentMethod);
  if (raw === 'ONLINE') {
    const g = (doc.onlinePaymentGateway ?? '').toString().toUpperCase();
    if (g === PaymentMethod.VNPAY) return PaymentMethod.VNPAY;
    if (g === PaymentMethod.MOMO) return PaymentMethod.MOMO;
    return PaymentMethod.MOMO;
  }
  if (
    raw === PaymentMethod.COD ||
    raw === PaymentMethod.MOMO ||
    raw === PaymentMethod.VNPAY
  ) {
    return raw as PaymentMethod;
  }
  return PaymentMethod.COD;
}

export class OrderMapper {
  static toDomain(doc: OrderDocumentWithLegacy): Order {
    const items: OrderItemSnapshot[] = (doc.items ?? []).map((i) => ({
      productId: i.productId.toString(),
      variantId: i.variantId.toString(),
      productName: i.productName,
      variantAttributes: i.variantAttributes ?? [],
      price: i.price,
      quantity: i.quantity,
      totalPrice: i.totalPrice,
    }));

    const addr: ShippingAddress = {
      fullName: doc.shippingAddress.fullName,
      phone: doc.shippingAddress.phone,
      line1: doc.shippingAddress.line1,
      line2: doc.shippingAddress.line2,
      district: doc.shippingAddress.district,
      city: doc.shippingAddress.city,
      country: doc.shippingAddress.country,
    };

    return Order.reconstitute({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      items,
      totalAmount: doc.totalAmount,
      discountAmount: doc.discountAmount ?? 0,
      finalAmount: doc.finalAmount,
      status: doc.status,
      paymentMethod: paymentMethodFromOrderDocument(doc),
      paymentStatus: doc.paymentStatus,
      shippingAddress: addr,
      paymentProviderReference: doc.paymentProviderReference ?? null,
      appliedCouponId: doc.appliedCouponId?.toString() ?? null,
      appliedCouponCode: doc.appliedCouponCode ?? null,
      createdAt: doc.createdAt,
    });
  }

  static toPersistence(order: Order): {
    userId: string;
    items: OrderItemSnapshot[];
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    shippingAddress: ShippingAddress;
    paymentProviderReference?: string | null;
    appliedCouponId?: string | null;
    appliedCouponCode?: string | null;
  } {
    return {
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      finalAmount: order.finalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      paymentProviderReference: order.paymentProviderReference ?? null,
      appliedCouponId: order.appliedCouponId ?? null,
      appliedCouponCode: order.appliedCouponCode ?? null,
    };
  }
}
