import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ICartRepository } from '../../../domain/repositories/cart.repository.interface';
import { CART_REPOSITORY } from '../../cart-repository.token';
import {
  CartResponseDto,
  toCartResponseDto,
} from '../../dtos/cart-response.dto';
import { RemoveCartItemCommand } from './remove-cart-item.command';

@Injectable()
export class RemoveCartItemHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: RemoveCartItemCommand): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(command.userId);
    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const had = cart.items.some((i) =>
      i.isSameItem(command.productId, command.variantId),
    );
    if (!had) {
      throw new NotFoundException('Không có dòng sản phẩm này trong giỏ');
    }

    try {
      cart.removeItem(command.productId, command.variantId);
      const saved = await this.cartRepository.save(cart);
      return toCartResponseDto(saved);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}
