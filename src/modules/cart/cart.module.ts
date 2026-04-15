import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CartDocument, CartSchema } from './infrastructure/persistence/cart.orm-entity';
import { CartRepositoryImpl } from './infrastructure/persistence/cart.repository.impl';
import { CART_REPOSITORY } from './application/cart-repository.token';
import { CartController } from './presentation/controllers/cart.controller';
import { GetMyCartHandler } from './application/queries/get-my-cart/get-my-cart.handler';
import { AddCartItemHandler } from './application/commands/add-cart-item/add-cart-item.handler';
import { RemoveCartItemHandler } from './application/commands/remove-cart-item/remove-cart-item.handler';
import { AdjustCartItemQuantityHandler } from './application/commands/adjust-cart-item-quantity/adjust-cart-item-quantity.handler';
import { ChangeCartItemVariantHandler } from './application/commands/change-cart-item-variant/change-cart-item-variant.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartDocument.name, schema: CartSchema },
    ]),
    AuthJwtModule,
  ],
  controllers: [CartController],
  providers: [
    CartRepositoryImpl,
    {
      provide: CART_REPOSITORY,
      useExisting: CartRepositoryImpl,
    },
    GetMyCartHandler,
    AddCartItemHandler,
    RemoveCartItemHandler,
    AdjustCartItemQuantityHandler,
    ChangeCartItemVariantHandler,
  ],
  exports: [MongooseModule, CART_REPOSITORY],
})
export class CartModule {}
