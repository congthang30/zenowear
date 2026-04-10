import { Module } from '@nestjs/common';
import { AuthJwtModule } from '../../common/auth-jwt.module';

import { MongooseModule } from '@nestjs/mongoose';
import {
  BrandDocument,
  BrandSchema,
} from './infrastructure/persistence/brand.orm-entity';
import { BrandController } from './presentation/controllers/brand.controller';
import { BrandRepositoryImpl } from './infrastructure/persistence/brand.repository.impl';
import { BRAND_REPOSITORY } from './application/category-repository.token';
import { CreateBrandHandler } from './application/commands/create-brand/create-category.handler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BrandDocument.name, schema: BrandSchema },
    ]),
    AuthJwtModule,
  ],
  controllers: [BrandController],
  providers: [
    BrandRepositoryImpl,
    {
      provide: BRAND_REPOSITORY,
      useExisting: BrandRepositoryImpl,
    },
    CreateBrandHandler,
  ],
  exports: [BrandRepositoryImpl, MongooseModule],
})
export class BrandModule {}
