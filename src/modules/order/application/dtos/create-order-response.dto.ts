import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Đặt hàng thành công.' })
  message!: string;

  @ApiPropertyOptional({
    description: 'Chỉ có khi MOMO/VNPAY — URL chuyển tới cổng thanh toán',
  })
  paymentRedirectUrl?: string;
}
