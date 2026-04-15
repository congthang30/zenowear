import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { CartItemProps } from '../../domain/entities/cart-item.entity';
import { Cart } from '../../domain/entities/cart.entity';
import type { ICartRepository } from '../../domain/repositories/cart.repository.interface';
import { CartDocument } from './cart.orm-entity';
import { CartMapper } from './cart.mapper';

@Injectable()
export class CartRepositoryImpl implements ICartRepository {
  constructor(
    @InjectModel(CartDocument.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  private toPersistedItems(items: CartItemProps[]) {
    return items.map((item) => ({
      productId: new Types.ObjectId(item.productId),
      variantId: item.variantId
        ? new Types.ObjectId(item.variantId)
        : undefined,
      quantity: item.quantity,
    }));
  }

  async save(cart: Cart): Promise<Cart> {
    const userOid = new Types.ObjectId(cart.userId);
    const payload = CartMapper.toPersistencePayload(cart);
    const items = this.toPersistedItems(payload.items);

    if (cart.id) {
      if (!Types.ObjectId.isValid(cart.id)) {
        throw new Error('Invalid cart id');
      }
      await this.cartModel.updateOne(
        { _id: new Types.ObjectId(cart.id), userId: userOid },
        { $set: { items } },
      );
      const doc = await this.cartModel.findById(cart.id).lean();
      return CartMapper.toDomain(doc as CartDocument);
    }

    const existing = await this.cartModel.findOne({ userId: userOid }).lean();
    if (existing) {
      await this.cartModel.updateOne(
        { _id: existing._id },
        { $set: { items } },
      );
      const updated = await this.cartModel.findById(existing._id).lean();
      return CartMapper.toDomain(updated as CartDocument);
    }

    const newId = new Types.ObjectId();
    await this.cartModel.create({
      _id: newId,
      userId: userOid,
      items,
    });
    const created = await this.cartModel.findById(newId).lean();
    return CartMapper.toDomain(created as CartDocument);
  }

  async findById(id: string): Promise<Cart | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.cartModel.findById(id).lean();
    if (!doc) return null;
    return CartMapper.toDomain(doc as CartDocument);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    if (!Types.ObjectId.isValid(userId)) return null;
    const doc = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    if (!doc) return null;
    return CartMapper.toDomain(doc as CartDocument);
  }

  async deleteById(cartId: string): Promise<void> {
    if (!Types.ObjectId.isValid(cartId)) return;
    await this.cartModel.deleteOne({ _id: new Types.ObjectId(cartId) });
  }

  async existsByUserId(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) return false;
    const n = await this.cartModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    return n > 0;
  }
}
