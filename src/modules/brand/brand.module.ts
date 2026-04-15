import { Module } from '@nestjs/common';
import { AuthJwtModule } from '../../common/auth-jwt.module';

import { MongooseModule } from '@nestjs/mongoose';
import {
  BrandDocument,
  BrandSchema,
} from './infrastructure/persistence/brand.orm-entity';
import { BrandController } from './presentation/controllers/brand.controller';
import { BrandRepositoryImpl } from './infrastructure/persistence/brand.repository.impl';
import { BRAND_REPOSITORY } from './application/brand-repository.token';
import { CreateBrandHandler } from './application/commands/create-brand/create-brand.handler';
import { UpdateBrandHandler } from './application/commands/update-brand/update-brand.handler';
import { SoftDeleteBrandHandler } from './application/commands/soft-delete-brand/soft-delete-brand.handler';
import { ChangeBrandStatusHandler } from './application/commands/change-brand-status/change-brand-status.handler';
import { GetActiveBrandsHandler } from './application/queries/get-active-brands/get-active-brands.handler';
import { GetBrandByIdHandler } from './application/queries/get-brand-by-id/get-brand-by-id.handler';

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
    UpdateBrandHandler,
    SoftDeleteBrandHandler,
    ChangeBrandStatusHandler,
    GetActiveBrandsHandler,
    GetBrandByIdHandler,
  ],
  exports: [BrandRepositoryImpl, BRAND_REPOSITORY, MongooseModule],
})
export class BrandModule {}
