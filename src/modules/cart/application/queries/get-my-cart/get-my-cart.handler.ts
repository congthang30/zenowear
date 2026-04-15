import { Inject, Injectable } from '@nestjs/common';
import type { ICartRepository } from '../../../domain/repositories/cart.repository.interface';
import { CART_REPOSITORY } from '../../cart-repository.token';
import {
  CartResponseDto,
  toCartResponseDto,
} from '../../dtos/cart-response.dto';
import { GetMyCartQuery } from './get-my-cart.query';

@Injectable()
export class GetMyCartHandler {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
  ) {}

  async execute(query: GetMyCartQuery): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findByUserId(query.userId);
    if (!cart) {
      return { userId: query.userId, items: [] };
    }
    return toCartResponseDto(cart);
  }
}
