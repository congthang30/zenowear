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
import { ChangeCartItemVariantCommand } from './change-cart-item-variant.command';

@Injectable()
export class ChangeCartItemVariantHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(
    command: ChangeCartItemVariantCommand,
  ): Promise<CartResponseDto> {
    if (command.fromVariantId === command.toVariantId) {
      throw new BadRequestException('Biến thể đích phải khác biến thể nguồn');
    }

    const cart = await this.cartRepository.findByUserId(command.userId);
    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const had = cart.items.some((i) =>
      i.isSameItem(command.productId, command.fromVariantId),
    );
    if (!had) {
      throw new NotFoundException('Không có dòng sản phẩm này trong giỏ');
    }

    try {
      cart.changeItemVariant(
        command.productId,
        command.fromVariantId,
        command.toVariantId,
      );
      const saved = await this.cartRepository.save(cart);
      return toCartResponseDto(saved);
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}
