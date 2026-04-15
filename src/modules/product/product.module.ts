import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

import {
  ProductDocument,
  ProductSchema,
} from './infrastructure/persistence/product.orm-entity';
import {
  ProductVariantDocument,
  ProductVariantSchema,
} from './infrastructure/persistence/product-variant.orm-entity';
import { ProductController } from './presentation/controllers/product.controller';
import { ProductRepositoryImpl } from './infrastructure/persistence/product.repository.impl';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler';
import { SoftDeleteProductHandler } from './application/commands/soft-delete-product/soft-delete-product.handler';
import { ChangeProductStatusHandler } from './application/commands/change-product-status/change-product-status.handler';
import { MarkProductFeaturedHandler } from './application/commands/mark-product-featured/mark-product-featured.handler';
import { IncrementProductViewHandler } from './application/commands/increment-product-view/increment-product-view.handler';
import { AddProductVariantHandler } from './application/commands/add-product-variant/add-product-variant.handler';
import { UpdateProductVariantHandler } from './application/commands/update-product-variant/update-product-variant.handler';
import { DeleteProductVariantHandler } from './application/commands/delete-product-variant/delete-product-variant.handler';
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
    CloudinaryModule,
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
    UpdateProductHandler,
    SoftDeleteProductHandler,
    ChangeProductStatusHandler,
    MarkProductFeaturedHandler,
    IncrementProductViewHandler,
    AddProductVariantHandler,
    UpdateProductVariantHandler,
    DeleteProductVariantHandler,
    GetProductHandler,
    GetProductsHandler,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
