export class PreviewOrderCommand {
  constructor(
    readonly userId: string,
    readonly discountAmount?: number,
    readonly couponCode?: string,
    /** IP từ edge/proxy — dùng cho giới hạn mã theo mạng, không lấy từ body */
    readonly couponAntiAbuseClientIp?: string,
  ) {}
}
