import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('smtp.host');
    const user = this.config.get<string>('smtp.user');
    if (host && user) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('smtp.port', 587),
        secure: this.config.get<number>('smtp.port', 587) === 465,
        auth: {
          user,
          pass: this.config.get<string>('smtp.pass', ''),
        },
      });
    }
  }

  async sendOrderConfirmation(
    to: string,
    params: {
      orderId: string;
      finalAmount: number;
      paymentMethod: string;
      stage?: 'placed' | 'paid';
    },
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('SMTP chưa cấu hình — bỏ qua gửi mail');
      return;
    }
    const from = this.config.get<string>('smtp.from', '');
    const paid = params.stage === 'paid';
    const subject = paid
      ? `[ZenoWear] Thanh toán thành công #${params.orderId}`
      : `[ZenoWear] Đặt hàng thành công #${params.orderId}`;
    const text = [
      paid
        ? 'Thanh toán online cho đơn hàng của bạn đã được xác nhận.'
        : 'Cảm ơn bạn đã đặt hàng.',
      `Mã đơn: ${params.orderId}`,
      `Tổng thanh toán: ${params.finalAmount.toLocaleString('vi-VN')} VND`,
      `Phương thức: ${params.paymentMethod}`,
    ].join('\n');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
      });
    } catch (e) {
      this.logger.error(
        `Gửi mail đơn hàng thất bại: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
