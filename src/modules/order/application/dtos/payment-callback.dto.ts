import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export enum PaymentCallbackOutcome {
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export class PaymentCallbackDto {
  @ApiProperty({
    description:
      'MongoId đơn, hoặc mã cổng trả về dạng {mongoId}__{timestamp} (sau khi tạo link thanh toán)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-f0-9]{24}(?:__[0-9]{10,20})?$/i, {
    message:
      'orderId phải là MongoId 24 ký tự hex hoặc {MongoId}__{timestamp} từ MoMo/VNPay',
  })
  orderId!: string;

  @ApiProperty({
    description: 'Mã giao dịch unique từ cổng thanh toán (idempotent)',
    example: 'pi_3QxYz123',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  gatewayReference!: string;

  @ApiProperty({ enum: PaymentCallbackOutcome })
  @IsEnum(PaymentCallbackOutcome)
  status!: PaymentCallbackOutcome;
}
