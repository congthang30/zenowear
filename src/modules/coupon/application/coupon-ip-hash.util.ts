import { createHmac } from 'node:crypto';

export function hashClientIpForCoupon(
  clientIp: string,
  salt: string,
): string | null {
  const ip = clientIp.trim();
  if (!ip || !salt.trim()) {
    return null;
  }
  return createHmac('sha256', salt).update(ip).digest('hex');
}
