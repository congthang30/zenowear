import { Product } from '../../domain/entities/product.entity';
import { ProductDocument } from './product.orm-entity';

export class ProductVarianMapper {
  static toDomain(doc: ProductDocument): Product;
}
