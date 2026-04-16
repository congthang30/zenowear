import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  PaymentMethod,
  isOnlinePaymentMethod,
} from '../../domain/enum/payment-method.enum';
import { ShippingAddressDto } from './shipping-address.dto';

export class CreateOrderDto {
  @ApiProperty({ enum: PaymentMethod, description: 'COD, MOMO hoặc VNPAY' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({
    type: ShippingAddressDto,
    description:
      'Nhập mới địa chỉ giao hàng; không dùng cùng lúc với addressId',
  })
  @ValidateIf((o) => !o.addressId)
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;

  @ApiPropertyOptional({
    description:
      'MongoId địa chỉ đã lưu (GET /api/v1/addresses); không dùng cùng lúc với shippingAddress',
  })
  @ValidateIf((o) => !o.shippingAddress)
  @IsMongoId()
  addressId?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Giảm thủ công (≤ tổng hàng). Bị bỏ qua nếu có couponCode',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Mã coupon — ưu tiên tính giảm theo mã' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Bắt buộc khi MOMO/VNPAY — URL frontend sau thanh toán',
  })
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsUrl({ require_protocol: true, require_tld: false })
  returnUrl?: string;

  @ApiPropertyOptional({ description: 'IP khách (VNPay); mặc định 127.0.0.1' })
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsOptional()
  @IsString()
  clientIp?: string;

  @ApiPropertyOptional({ description: 'URL IPN MoMo (mặc định dùng returnUrl)' })
  @ValidateIf((o) => isOnlinePaymentMethod(o.paymentMethod))
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  ipnUrl?: string;
}
