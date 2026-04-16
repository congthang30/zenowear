/** Phân tách MongoId đơn với hậu tố chống trùng khi gửi MoMo/VNPay (mỗi lần tạo link). */
const INTERNAL_ORDER_HEX = /^[a-f0-9]{24}$/i;
const WITH_ATTEMPT_SUFFIX = /^([a-f0-9]{24})__(\d{10,20})$/i;

/** Mã gửi sang cổng — mỗi lần gọi API tạo giao dịch là khác nhau (tránh lỗi trùng orderId). */
export function makeGatewayMerchantOrderId(internalOrderId: string): string {
  return `${internalOrderId}__${Date.now()}`;
}

/** Lấy MongoId đơn từ body callback / query cổng (có hoặc không có __timestamp). */
export function parseInternalOrderIdFromGatewayMerchantOrderId(
  raw: string,
): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const composite = trimmed.match(WITH_ATTEMPT_SUFFIX);
  if (composite) return composite[1].toLowerCase();
  if (INTERNAL_ORDER_HEX.test(trimmed)) return trimmed.toLowerCase();
  return null;
}
