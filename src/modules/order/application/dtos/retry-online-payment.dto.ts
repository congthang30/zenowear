import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { PaymentMethod } from '../../domain/enum/payment-method.enum';

export class RetryOnlinePaymentDto {
  @ApiPropertyOptional({
    enum: PaymentMethod,
    description:
      'Bắt buộc nếu đơn đang COD và muốn chuyển sang online: MOMO hoặc VNPAY. Bỏ qua nếu đơn đã MOMO/VNPAY (chỉ tạo lại link). Có thể gửi chữ thường (momo → MOMO).',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    description:
      'Bắt buộc khi kết quả là MOMO hoặc VNPAY (đổi sang online hoặc thanh toán lại online). Không dùng khi chuyển sang COD.',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  returnUrl?: string;

  @ApiPropertyOptional({ description: 'IP khách (VNPay)' })
  @IsOptional()
  @IsString()
  clientIp?: string;

  @ApiPropertyOptional({ description: 'URL IPN MoMo' })
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  ipnUrl?: string;
}
