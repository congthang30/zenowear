import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart } from '../../../cart/domain/entities/cart.entity';
import { PRODUCT_REPOSITORY } from '../../../product/application/product-repository.token';
import type { IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import { ProductStatus } from '../../../product/domain/enum/productStatus.enum';
import type { OrderItemSnapshot } from '../../domain/entities/order.entity';
import { Stock } from '../../../product/domain/value-objects/stock.vo';

@Injectable()
export class OrderCheckoutService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async buildSnapshotsFromCart(cart: Cart): Promise<OrderItemSnapshot[]> {
    if (!cart.items.length) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const snapshots: OrderItemSnapshot[] = [];

    for (const line of cart.items) {
      if (!line.variantId) {
        throw new BadRequestException(
          `Mỗi dòng trong giỏ phải có variantId (sản phẩm ${line.productId})`,
        );
      }

      const product = await this.productRepository.findById(line.productId);
      if (
        !product?.id ||
        product.deletedAt ||
        product.status !== ProductStatus.ACTIVE
      ) {
        throw new BadRequestException(
          `Sản phẩm không khả dụng: ${line.productId}`,
        );
      }

      const variant = await this.productRepository.findVariantById(
        line.variantId,
      );
      if (
        !variant?.id ||
        variant.deletedAt ||
        variant.productId !== product.id
      ) {
        throw new BadRequestException(
          `Biến thể không hợp lệ: ${line.variantId}`,
        );
      }

      if (variant.stock.available < line.quantity) {
        throw new BadRequestException(
          `Không đủ tồn kho cho ${product.productName.value} / ${variant.sku.value}: còn ${variant.stock.available}, cần ${line.quantity}`,
        );
      }

      if (variant.stock.available <= 0) {
        throw new BadRequestException(
          `Hết hàng: ${product.productName.value} (${variant.sku.value})`,
        );
      }

      const price = variant.price.value;
      snapshots.push({
        productId: product.id!,
        variantId: variant.id!,
        productName: product.productName.value,
        variantAttributes: [...variant.attributes],
        price,
        quantity: line.quantity,
        totalPrice: price * line.quantity,
      });
    }

    return snapshots;
  }

  async decrementStocks(items: OrderItemSnapshot[]): Promise<void> {
    for (const it of items) {
      const v = await this.productRepository.findVariantById(it.variantId);
      if (!v?.id) {
        throw new NotFoundException(`Biến thể không tồn tại: ${it.variantId}`);
      }
      if (v.stock.available < it.quantity) {
        throw new BadRequestException(`Tồn kho không đủ: ${it.variantId}`);
      }
      const next = Stock.create(v.stock.available - it.quantity, 0);
      v.update({ stock: next });
      await this.productRepository.saveVariant(v);
    }
  }

  async incrementStocks(items: OrderItemSnapshot[]): Promise<void> {
    for (const it of items) {
      const v = await this.productRepository.findVariantById(it.variantId);
      if (!v?.id) continue;
      const next = Stock.create(v.stock.available + it.quantity, 0);
      v.update({ stock: next });
      await this.productRepository.saveVariant(v);
    }
  }
}
