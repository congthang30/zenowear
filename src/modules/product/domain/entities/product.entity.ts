import { ProductStatus } from '../enum/productStatus.enum';
import { Barcode } from '../value-objects/barcode.vo';
import { ProductName } from '../value-objects/productName.vo';
import { Slug } from '../value-objects/slug.vo';

export class Product {
  private constructor(
    private readonly _id: string | undefined,
    private _productName: ProductName,
    private _slug: Slug,
    private _barcode: Barcode,
    private _description: string,
    private _status: ProductStatus,
    private _isFeatured: boolean,
    private _images?: string[],
    private _videoUrl?: string,
    private _viewCount: number,
    private _totalSold: number,
    private _ratingAverage: number,
    private _reviewCount: number,
    private _ratingTotal: number,
    private _tags: string[],
    private _deletedAt: Date | undefined,
    private _brandId: string,
    private _categoryId: string,
  ) {}

  static createForNewProduct(props: {
    productName: ProductName;
    slug: Slug;
    barcode: Barcode;
    description?: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    images?: string[];
    videoUrl?: string;
    brandId: string;
    categoryId: string;
  }): Product {
    return new Product(
      undefined,
      props.productName,
      props.slug,
      props.barcode,
      props.description ?? '',
      props.status ?? ProductStatus.ACTIVE,
      props.isFeatured ?? false,
      props.images ?? [],
      props.videoUrl,
      0,
      0,
      0,
      0,
      0,
      [],
      undefined,
      props.brandId,
      props.categoryId,
    );
  }
  static reconstitute(props: { id: string; productName: ProductName });
}
