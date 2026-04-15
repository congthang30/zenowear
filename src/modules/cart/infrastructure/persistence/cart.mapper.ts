import type { CartItemProps } from '../../domain/entities/cart-item.entity';
import { Cart } from '../../domain/entities/cart.entity';
import { CartDocument } from './cart.orm-entity';
import { CartItemMapper } from './cart-item.mapper';

export class CartMapper {
  static toDomain(doc: CartDocument): Cart {
    return Cart.reconstitute({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      items: doc.items.map((item) => CartItemMapper.toDomainProps(item)),
    });
  }

  static toPersistencePayload(entity: Cart): {
    userId: string;
    items: CartItemProps[];
  } {
    return {
      userId: entity.userId,
      items: entity.items.map((item) => CartItemMapper.toPersistence(item)),
    };
  }
}
