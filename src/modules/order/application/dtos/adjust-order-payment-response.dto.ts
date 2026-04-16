import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustOrderPaymentResponseDto {
  @ApiPropertyOptional({
    description:
      'Có khi kết quả là MOMO/VNPAY (thanh toán lại hoặc đổi sang online). Không có khi chuyển sang COD.',
  })
  paymentRedirectUrl?: string;
}
