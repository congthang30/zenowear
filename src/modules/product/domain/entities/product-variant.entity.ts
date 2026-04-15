import { Sku } from '../value-objects/sku.vo';
import { Price } from '../value-objects/price.vo';
import { OriginalPrice } from '../value-objects/originalPrice.vo';
import { Stock } from '../value-objects/stock.vo';

export type ProductVariantProps = {
  id?: string;
  productId: string;
  sku: Sku;
  attributes: { key: string; value: string }[];
  originalPrice: OriginalPrice;
  price: Price;
  stock: Stock;
  isDefault: boolean;
  images?: string[];
  deletedAt?: Date;
};

export class ProductVariant {
  private readonly _id?: string;
  private _productId: string;
  private _sku: Sku;
  private _attributes: { key: string; value: string }[];
  private _originalPrice: OriginalPrice;
  private _price: Price;
  private _stock: Stock;
  private _isDefault: boolean;
  private _images?: string[];
  private _deletedAt?: Date;

  private constructor(props: ProductVariantProps) {
    this._id = props.id;
    this._productId = props.productId;
    this._sku = props.sku;
    this._attributes = props.attributes;
    this._originalPrice = props.originalPrice;
    this._price = props.price;
    this._stock = props.stock;
    this._isDefault = props.isDefault;
    this._images = props.images;
    this._deletedAt = props.deletedAt;
  }

  static create(props: Omit<ProductVariantProps, 'id'>): ProductVariant {
    return new ProductVariant(props);
  }

  static reconstitute(props: ProductVariantProps): ProductVariant {
    return new ProductVariant(props);
  }

  // Getters
  get id(): string | undefined {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get sku(): Sku {
    return this._sku;
  }

  get attributes(): { key: string; value: string }[] {
    return this._attributes;
  }

  get originalPrice(): OriginalPrice {
    return this._originalPrice;
  }

  get price(): Price {
    return this._price;
  }

  get stock(): Stock {
    return this._stock;
  }

  get isDefault(): boolean {
    return this._isDefault;
  }

  get images(): string[] | undefined {
    return this._images;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }
}
