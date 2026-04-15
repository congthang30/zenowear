import { Cart } from '../entities/cart.entity';

export interface ICartRepository {
  save(cart: Cart): Promise<Cart>;

  findById(id: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;

  deleteById(cartId: string): Promise<void>;

  existsByUserId(userId: string): Promise<boolean>;
}
