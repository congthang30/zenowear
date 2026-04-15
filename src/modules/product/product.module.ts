import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';

import { ProductDocument, ProductSchema } from './infrastructure/persistence/product.orm-entity';
import { ProductVariantDocument, ProductVariantSchema } from './infrastructure/persistence/product-variant.orm-entity';
import { ProductController } from './presentation/controllers/product.controller';
import { ProductRepositoryImpl } from './infrastructure/persistence/product.repository.impl';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { GetProductHandler } from './application/queries/get-product/get-product.handler';
import { GetProductsHandler } from './application/queries/get-products/get-products.handler';
import { BrandModule } from '../brand/brand.module';
import { CategoryModule } from '../category/category.module';
import { PRODUCT_REPOSITORY } from './application/product-repository.token';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductDocument.name, schema: ProductSchema },
      { name: ProductVariantDocument.name, schema: ProductVariantSchema },
    ]),
    AuthJwtModule,
    BrandModule,
    CategoryModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductRepositoryImpl,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: ProductRepositoryImpl,
    },
    CreateProductHandler,
    GetProductHandler,
    GetProductsHandler,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
