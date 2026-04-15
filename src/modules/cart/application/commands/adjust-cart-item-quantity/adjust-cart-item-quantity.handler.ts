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
import { AdjustCartItemQuantityCommand } from './adjust-cart-item-quantity.command';

@Injectable()
export class AdjustCartItemQuantityHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(
    command: AdjustCartItemQuantityCommand,
  ): Promise<CartResponseDto> {
    if (command.delta === 0) {
      throw new BadRequestException('delta không được bằng 0');
    }

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
      if (command.delta > 0) {
        cart.increaseItemQuantity(
          command.productId,
          command.variantId,
          command.delta,
        );
      } else {
        cart.decreaseItemQuantity(
          command.productId,
          command.variantId,
          Math.abs(command.delta),
        );
      }
      const saved = await this.cartRepository.save(cart);
      return toCartResponseDto(saved);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof BadRequestException) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === 'Item not in cart') {
        throw new NotFoundException('Không có dòng sản phẩm này trong giỏ');
      }
      throw new BadRequestException(msg);
    }
  }
}
