import type { CartItemProps } from '../../domain/entities/cart-item.entity';
import { CartItem } from '../../domain/entities/cart-item.entity';
import type { CartItemDocument } from './cart-item.orm-entity';

export class CartItemMapper {
  static toDomainProps(doc: CartItemDocument): CartItemProps {
    return {
      productId: doc.productId.toString(),
      variantId: doc.variantId?.toString(),
      quantity: doc.quantity,
    };
  }

  static toDomain(doc: CartItemDocument): CartItem {
    return CartItem.reconstitute(CartItemMapper.toDomainProps(doc));
  }

  /** Giống `ProductVariantMapper.toPersistence`: plain string/number, repository gán ObjectId khi ghi DB. */
  static toPersistence(entity: CartItem): CartItemProps {
    return {
      productId: entity.productId,
      variantId: entity.variantId,
      quantity: entity.quantity,
    };
  }
}
