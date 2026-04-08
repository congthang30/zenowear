import { ProductName } from '../value-objects/productName.vo';

export class Product {
  private constructor(
    private readonly _id: string | undefined,
    private _productName: ProductName,
    private _barcode: string,
  ) {}
}
