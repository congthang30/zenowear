import { ProductStatus } from '../enum/productStatus.enum';
import { Barcode } from '../value-objects/barcode.vo';
import { ProductName } from '../value-objects/productName.vo';
import { Slug } from '../value-objects/slug.vo';

type ProductProps = {
  id?: string;
  productName: ProductName;
  slug: Slug;
  barcode: Barcode;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  viewCount: number;
  totalSold: number;
  ratingAverage: number;
  reviewCount: number;
  ratingTotal: number;
  tags: string[];
  brandId: string;
  categoryId: string;
  images?: string[];
  videoUrl?: string;
  deletedAt?: Date;
};

export class Product {
  private readonly _id?: string;
  private _productName: ProductName;
  private _slug: Slug;
  private _barcode: Barcode;
  private _description: string;
  private _status: ProductStatus;
  private _isFeatured: boolean;
  private _viewCount: number;
  private _totalSold: number;
  private _ratingAverage: number;
  private _reviewCount: number;
  private _ratingTotal: number;
  private _tags: string[];
  private _brandId: string;
  private _categoryId: string;
  private _images?: string[];
  private _videoUrl?: string;
  private _deletedAt?: Date;

  private constructor(props: ProductProps) {
    this._id = props.id;
    this._productName = props.productName;
    this._slug = props.slug;
    this._barcode = props.barcode;
    this._description = props.description;
    this._status = props.status;
    this._isFeatured = props.isFeatured;
    this._viewCount = props.viewCount;
    this._totalSold = props.totalSold;
    this._ratingAverage = props.ratingAverage;
    this._reviewCount = props.reviewCount;
    this._ratingTotal = props.ratingTotal;
    this._tags = props.tags;
    this._brandId = props.brandId;
    this._categoryId = props.categoryId;
    this._images = props.images;
    this._videoUrl = props.videoUrl;
    this._deletedAt = props.deletedAt;

    this.validate();
  }

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
    return new Product({
      productName: props.productName,
      slug: props.slug,
      barcode: props.barcode,
      description: props.description ?? '',
      status: props.status ?? ProductStatus.ACTIVE,
      isFeatured: props.isFeatured ?? false,
      viewCount: 0,
      totalSold: 0,
      ratingAverage: 0,
      reviewCount: 0,
      ratingTotal: 0,
      tags: [],
      brandId: props.brandId,
      categoryId: props.categoryId,
      images: props.images,
      videoUrl: props.videoUrl,
    });
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  activate() {
    this._status = ProductStatus.ACTIVE;
  }

  inactivate() {
    this._status = ProductStatus.INACTIVE;
  }

  markAsOutOfStock() {
    this._status = ProductStatus.OUT_OF_STOCK;
  }

  increaseView() {
    this._viewCount++;
  }

  addSold(quantity: number) {
    if (quantity <= 0) throw new Error('Quantity must be > 0');
    this._totalSold += quantity;
  }

  addRating(score: number) {
    if (score < 1 || score > 5)
      throw new Error('Rating must be between 1 and 5');

    this._ratingTotal += score;
    this._reviewCount++;
    this._ratingAverage = this._ratingTotal / this._reviewCount;
  }

  addTag(tag: string) {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
    }
  }

  removeTag(tag: string) {
    this._tags = this._tags.filter((t) => t !== tag);
  }

  markDeleted() {
    this._deletedAt = new Date();
  }

  private validate() {
    if (!this._brandId) throw new Error('BrandId is required');
    if (!this._categoryId) throw new Error('CategoryId is required');
  }

  get id(): string | undefined {
    return this._id;
  }

  get productName(): ProductName {
    return this._productName;
  }

  get slug(): Slug {
    return this._slug;
  }

  get barcode(): Barcode {
    return this._barcode;
  }

  get description(): string {
    return this._description;
  }

  get status(): ProductStatus {
    return this._status;
  }

  get isFeatured(): boolean {
    return this._isFeatured;
  }

  get images(): string[] | undefined {
    return this._images;
  }

  get videoUrl(): string | undefined {
    return this._videoUrl;
  }

  get viewCount(): number {
    return this._viewCount;
  }

  get totalSold(): number {
    return this._totalSold;
  }

  get ratingAverage(): number {
    return this._ratingAverage;
  }

  get reviewCount(): number {
    return this._reviewCount;
  }

  get ratingTotal(): number {
    return this._ratingTotal;
  }

  get tags(): string[] {
    return this._tags;
  }

  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }

  get brandId(): string {
    return this._brandId;
  }

  get categoryId(): string {
    return this._categoryId;
  }
}
