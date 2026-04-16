function intEnv(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(v) ? v : fallback;
}

export default () => ({
  coupon: {
    restoreOnCancel:
      String(process.env.COUPON_RESTORE_ON_CANCEL ?? 'true').toLowerCase() !==
      'false',
    /** Tối đa số user khác nhau dùng cùng mã từ cùng IP trong cửa sổ dưới; 0 = tắt */
    maxDistinctUsersPerCouponPerIpPerWindow: intEnv(
      'COUPON_MAX_DISTINCT_USERS_PER_IP',
      0,
    ),
    ipAbuseWindowHours: Math.min(
      168,
      Math.max(1, intEnv('COUPON_IP_ABUSE_WINDOW_HOURS', 24)),
    ),
    /** Bắt buộc để bật giới hạn theo IP (HMAC IP); đổi trên production */
    ipHashSalt: process.env.COUPON_IP_HASH_SALT ?? '',
    throttleTtlMs: Math.max(1000, intEnv('COUPON_THROTTLE_TTL_MS', 60_000)),
    throttleLimit: Math.max(1, intEnv('COUPON_THROTTLE_LIMIT', 40)),
  },
});
