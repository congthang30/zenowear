import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import {
  PaymentMethod,
  isOnlinePaymentMethod,
} from '../../domain/enum/payment-method.enum';

export class ChangeOrderPaymentMethodDto {
  @ApiProperty({
    enum: PaymentMethod,
    description: 'Phương thức mới: COD, MOMO hoặc VNPAY (đổi trong 24h, đơn PENDING, chưa PAID)',
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ description: 'Bắt buộc khi chuyển sang MOMO/VNPAY' })
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsUrl({ require_protocol: true, require_tld: false })
  returnUrl?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsOptional()
  @IsString()
  clientIp?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  ipnUrl?: string;
}
