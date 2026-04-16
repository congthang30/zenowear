import type { Request } from 'express';

function firstHeaderValue(
  req: Pick<Request, 'headers'>,
  name: string,
): string | undefined {
  const v = req.headers[name];
  if (typeof v === 'string') {
    return v.split(',')[0]?.trim();
  }
  if (Array.isArray(v)) {
    return v[0]?.split(',')[0]?.trim();
  }
  return undefined;
}

/**
 * IP dùng cho **chống lạm dụng mã / rate limit theo mạng** — không đọc từ body/query
 * (body là kênh người dùng kiểm soát, dễ fake để né giới hạn theo IP).
 *
 * Thứ tự: header do edge/proxy tin cậy gắn → `req.ip` (cần `trust proxy` khi sau reverse proxy)
 * → `x-forwarded-for` (chỉ an toàn nếu proxy đã lọc/ghi đè) → socket.
 *
 * **Triển khai production:** đặt app sau Nginx/Cloudflare, bật `TRUST_PROXY`, để proxy gắn
 * `X-Real-IP` / `CF-Connecting-IP` / chuẩn hóa `X-Forwarded-For`.
 */
export function resolveClientIpTrusted(
  req: Pick<Request, 'ip' | 'headers' | 'socket'>,
): string | undefined {
  const fromEdge = [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
  ] as const;
  for (const h of fromEdge) {
    const x = firstHeaderValue(req, h);
    if (x) {
      return x;
    }
  }

  const ip = req.ip?.trim();
  if (ip && ip !== '::1' && ip !== '127.0.0.1') {
    return ip;
  }

  const xf = firstHeaderValue(req, 'x-forwarded-for');
  if (xf) {
    return xf;
  }

  const ra = req.socket?.remoteAddress?.trim();
  if (ra && ra !== '::1' && ra !== '127.0.0.1') {
    return ra;
  }
  return undefined;
}

/**
 * IP gửi sang cổng thanh toán (MoMo/VNPay): có thể nhận `explicitIp` từ body
 * khi app native không đi qua header chuẩn — **không dùng** cho logic coupon anti-abuse.
 */
export function resolveClientIp(
  req: Pick<Request, 'ip' | 'headers' | 'socket'>,
  explicitIp?: string | null,
): string | undefined {
  const trimmed = explicitIp?.trim();
  if (trimmed) {
    return trimmed;
  }
  return resolveClientIpTrusted(req);
}
