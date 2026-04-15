import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CartItem } from '../../../domain/entities/cart-item.entity';
import { Cart } from '../../../domain/entities/cart.entity';
import type { ICartRepository } from '../../../domain/repositories/cart.repository.interface';
import { CART_REPOSITORY } from '../../cart-repository.token';
import {
  CartResponseDto,
  toCartResponseDto,
} from '../../dtos/cart-response.dto';
import { AddCartItemCommand } from './add-cart-item.command';

@Injectable()
export class AddCartItemHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(command: AddCartItemCommand): Promise<CartResponseDto> {
    try {
      const existing =
        (await this.cartRepository.findByUserId(command.userId)) ??
        Cart.create(command.userId);

      const line = CartItem.create({
        productId: command.productId,
        variantId: command.variantId,
        quantity: command.quantity,
      });

      existing.addItem(line);
      const saved = await this.cartRepository.save(existing);
      return toCartResponseDto(saved);
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}
