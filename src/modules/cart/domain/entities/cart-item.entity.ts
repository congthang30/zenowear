export type CartItemProps = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export class CartItem {
  private constructor(
    private readonly _productId: string,
    private readonly _variantId: string | undefined,
    private _quantity: number,
  ) {}

  static create(props: CartItemProps): CartItem {
    if (!props.productId) throw new Error('productId is required');
    if (props.quantity <= 0) throw new Error('quantity must be > 0');

    return new CartItem(props.productId, props.variantId, props.quantity);
  }

  static reconstitute(props: CartItemProps): CartItem {
    return new CartItem(props.productId, props.variantId, props.quantity);
  }

  increase(qty: number) {
    if (qty <= 0) throw new Error('quantity must be > 0');
    this._quantity += qty;
  }

  decrease(qty: number) {
    if (qty <= 0) throw new Error('quantity must be > 0');
    if (this._quantity - qty < 0) throw new Error('quantity < 0');
    this._quantity -= qty;
  }

  isSameItem(productId: string, variantId?: string) {
    return this._productId === productId && this._variantId === variantId;
  }

  get productId() {
    return this._productId;
  }
  get variantId() {
    return this._variantId;
  }
  get quantity() {
    return this._quantity;
  }
}
