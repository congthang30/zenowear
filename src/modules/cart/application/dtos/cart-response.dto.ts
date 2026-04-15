import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cart } from '../../domain/entities/cart.entity';

export class CartLineResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId!: string;

  @ApiPropertyOptional({ example: '507f191e810c19729de860ea' })
  variantId?: string;

  @ApiProperty({ example: 2 })
  quantity!: number;
}

export class CartResponseDto {
  @ApiPropertyOptional({ description: 'Có sau khi đã lưu giỏ trong DB' })
  id?: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ type: [CartLineResponseDto] })
  items!: CartLineResponseDto[];
}

export function toCartResponseDto(cart: Cart): CartResponseDto {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
  };
}
