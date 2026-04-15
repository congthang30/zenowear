import { CartItem } from './cart-item.entity';

type CartReconstituteProps = {
  id?: string;
  userId: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
};

export class Cart {
  private constructor(
    private readonly _id: string | undefined,
    private _userId: string,
    private _items: CartItem[],
  ) {}

  static create(userId: string): Cart {
    if (!userId) throw new Error('userId is required');
    return new Cart(undefined, userId, []);
  }

  static reconstitute(props: CartReconstituteProps): Cart {
    const items = props.items.map((item) => CartItem.reconstitute(item));

    return new Cart(props.id, props.userId, items);
  }

  addItem(item: CartItem) {
    const existing = this._items.find((i) =>
      i.isSameItem(item.productId, item.variantId),
    );

    if (existing) {
      existing.increase(item.quantity);
      return;
    }

    this._items.push(item);
  }

  removeItem(productId: string, variantId?: string) {
    this._items = this._items.filter(
      (i) => !i.isSameItem(productId, variantId),
    );
  }

  increaseItemQuantity(
    productId: string,
    variantId: string | undefined,
    qty: number,
  ) {
    const existing = this._items.find((i) =>
      i.isSameItem(productId, variantId),
    );
    if (!existing) {
      throw new Error('Item not in cart');
    }
    existing.increase(qty);
  }

  decreaseItemQuantity(
    productId: string,
    variantId: string | undefined,
    qty: number,
  ) {
    const existing = this._items.find((i) =>
      i.isSameItem(productId, variantId),
    );
    if (!existing) {
      throw new Error('Item not in cart');
    }
    if (existing.quantity <= qty) {
      this.removeItem(productId, variantId);
      return;
    }
    existing.decrease(qty);
  }

  get id() {
    return this._id;
  }
  get userId() {
    return this._userId;
  }
  get items() {
    return this._items;
  }
}
