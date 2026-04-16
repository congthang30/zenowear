export enum PaymentMethod {
  COD = 'COD',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export function isOnlinePaymentMethod(m: PaymentMethod): boolean {
  return m === PaymentMethod.MOMO || m === PaymentMethod.VNPAY;
}
