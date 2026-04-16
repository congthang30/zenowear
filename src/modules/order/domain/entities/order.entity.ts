import { OrderStatus } from '../enum/order-status.enum';
import {
  PaymentMethod,
  isOnlinePaymentMethod,
} from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

export type OrderItemSnapshot = {
  productId: string;
  variantId: string;
  productName: string;
  variantAttributes: { key: string; value: string }[];
  price: number;
  quantity: number;
  totalPrice: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  city: string;
  country?: string;
};

export type OrderProps = {
  id?: string;
  userId: string;
  items: OrderItemSnapshot[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  paymentProviderReference?: string | null;
  appliedCouponId?: string | null;
  appliedCouponCode?: string | null;
  createdAt?: Date;
};

const PAYMENT_ADJUSTMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

export class Order {
  private constructor(
    private readonly _id: string | undefined,
    private readonly _userId: string,
    private readonly _items: OrderItemSnapshot[],
    private readonly _totalAmount: number,
    private readonly _discountAmount: number,
    private _finalAmount: number,
    private _status: OrderStatus,
    private _paymentMethod: PaymentMethod,
    private _paymentStatus: PaymentStatus,
    private readonly _shippingAddress: ShippingAddress,
    private _paymentProviderReference: string | null | undefined,
    private readonly _appliedCouponId?: string | null,
    private readonly _appliedCouponCode?: string | null,
    private readonly _createdAt?: Date,
  ) {}

  static createNew(props: {
    userId: string;
    items: OrderItemSnapshot[];
    discountAmount: number;
    paymentMethod: PaymentMethod;
    shippingAddress: ShippingAddress;
    appliedCouponId?: string | null;
    appliedCouponCode?: string | null;
  }): Order {
    if (!props.items.length) {
      throw new Error('Đơn hàng phải có ít nhất một dòng');
    }
    const totalAmount = props.items.reduce((s, i) => s + i.totalPrice, 0);
    const discount = Math.max(0, props.discountAmount);
    if (discount > totalAmount) {
      throw new Error('Giảm giá không được vượt tổng tiền hàng');
    }
    const finalAmount = totalAmount - discount;
    const paymentStatus = PaymentStatus.UNPAID;

    return new Order(
      undefined,
      props.userId,
      props.items,
      totalAmount,
      discount,
      finalAmount,
      OrderStatus.PENDING,
      props.paymentMethod,
      paymentStatus,
      props.shippingAddress,
      null,
      props.appliedCouponId ?? null,
      props.appliedCouponCode ?? null,
      undefined,
    );
  }

  static reconstitute(props: OrderProps): Order {
    return new Order(
      props.id,
      props.userId,
      props.items,
      props.totalAmount,
      props.discountAmount,
      props.finalAmount,
      props.status,
      props.paymentMethod,
      props.paymentStatus,
      props.shippingAddress,
      props.paymentProviderReference ?? null,
      props.appliedCouponId ?? null,
      props.appliedCouponCode ?? null,
      props.createdAt,
    );
  }

  confirmByAdmin() {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Chỉ xác nhận đơn ở trạng thái PENDING');
    }
    this._status = OrderStatus.CONFIRMED;
  }

  applyAdminStatus(next: OrderStatus) {
    const valid =
      (this._status === OrderStatus.PENDING &&
        [OrderStatus.CONFIRMED, OrderStatus.CANCELLED].includes(next)) ||
      (this._status === OrderStatus.CONFIRMED &&
        [OrderStatus.SHIPPING, OrderStatus.CANCELLED].includes(next)) ||
      (this._status === OrderStatus.SHIPPING &&
        next === OrderStatus.DELIVERED);
    if (!valid) {
      throw new Error(`Không thể chuyển ${this._status} → ${next}`);
    }
    this._status = next;
    if (
      next === OrderStatus.DELIVERED &&
      this._paymentMethod === PaymentMethod.COD &&
      this._paymentStatus === PaymentStatus.UNPAID
    ) {
      this._paymentStatus = PaymentStatus.PAID;
    }
  }

  cancelByUser() {
    if (this._status === OrderStatus.SHIPPING || this._status === OrderStatus.DELIVERED) {
      throw new Error('Không thể hủy đơn đang giao hoặc đã giao');
    }
    if (this._status === OrderStatus.CANCELLED) return;
    this._status = OrderStatus.CANCELLED;
  }

  applyOnlinePaymentSuccess(reference: string) {
    if (!isOnlinePaymentMethod(this._paymentMethod)) {
      throw new Error('Chỉ áp dụng cho thanh toán MOMO/VNPAY');
    }
    if (this._paymentProviderReference === reference) {
      return;
    }
    if (this._paymentStatus === PaymentStatus.PAID) {
      return;
    }
    this._paymentStatus = PaymentStatus.PAID;
    this._paymentProviderReference = reference;
  }

  applyOnlinePaymentFailed(reference: string) {
    if (!isOnlinePaymentMethod(this._paymentMethod)) return;
    if (this._paymentProviderReference === reference) {
      return;
    }
    if (this._paymentStatus === PaymentStatus.PAID) {
      return;
    }
    this._paymentStatus = PaymentStatus.FAILED;
    this._paymentProviderReference = reference;
  }

  assertPaymentAdjustable(now: Date = new Date()): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Chỉ đơn PENDING mới chỉnh thanh toán');
    }
    if (this._paymentStatus === PaymentStatus.PAID) {
      throw new Error('Đơn đã thanh toán');
    }
    const created = this._createdAt;
    if (!created) {
      throw new Error('Thiếu thời điểm tạo đơn (createdAt)');
    }
    if (now.getTime() - created.getTime() > PAYMENT_ADJUSTMENT_WINDOW_MS) {
      throw new Error('Đã quá 24 giờ kể từ khi tạo đơn');
    }
  }

  /** Chuẩn bị tạo link thanh toán online mới (xoá FAILED / mã cổng cũ). */
  resetOnlinePaymentForRetry(): void {
    if (!isOnlinePaymentMethod(this._paymentMethod)) {
      throw new Error('Chỉ áp dụng đơn MOMO/VNPAY');
    }
    if (this._paymentStatus === PaymentStatus.PAID) {
      throw new Error('Đơn đã thanh toán');
    }
    this._paymentStatus = PaymentStatus.UNPAID;
    this._paymentProviderReference = null;
  }

  /** Đổi COD ↔ MOMO ↔ VNPAY (trong cửa sổ điều chỉnh thanh toán). */
  switchPaymentMethod(target: PaymentMethod): void {
    if (this._paymentMethod === target) {
      throw new Error('Đơn đã dùng phương thức này');
    }
    this._paymentMethod = target;
    this._paymentStatus = PaymentStatus.UNPAID;
    this._paymentProviderReference = null;
  }

  get id() {
    return this._id;
  }
  get userId() {
    return this._userId;
  }
  get items() {
    return this._items;
  }
  get totalAmount() {
    return this._totalAmount;
  }
  get discountAmount() {
    return this._discountAmount;
  }
  get finalAmount() {
    return this._finalAmount;
  }
  get status() {
    return this._status;
  }
  get paymentMethod() {
    return this._paymentMethod;
  }
  get paymentStatus() {
    return this._paymentStatus;
  }
  get shippingAddress() {
    return this._shippingAddress;
  }
  get paymentProviderReference() {
    return this._paymentProviderReference;
  }
  get createdAt() {
    return this._createdAt;
  }
  get appliedCouponId() {
    return this._appliedCouponId ?? null;
  }
  get appliedCouponCode() {
    return this._appliedCouponCode ?? null;
  }
}
