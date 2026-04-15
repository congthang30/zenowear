import { Module } from '@nestjs/common';
import {
  CategoryDocument,
  CategorySchema,
} from './infrastructure/persistence/category.orm-entity';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CreateCategoryHandler } from './application/commands/create-category/create-category.handler';
import { UpdateCategoryHandler } from './application/commands/update-category/update-category.handler';
import { SoftDeleteCategoryHandler } from './application/commands/soft-delete-category/soft-delete-category.handler';
import { ChangeCategoryStatusHandler } from './application/commands/change-category-status/change-category-status.handler';
import { GetActiveCategoriesHandler } from './application/queries/get-active-categories/get-active-categories.handler';
import { GetCategoryByIdHandler } from './application/queries/get-category-by-id/get-category-by-id.handler';
import { GetCategoryTreeHandler } from './application/queries/get-category-tree/get-category-tree.handler';
import { CategoryRepositoryImpl } from './infrastructure/persistence/category.repository.impl';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_REPOSITORY } from './application/category-repository.token';
import { CategoryController } from './presentation/controllers/category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryDocument.name, schema: CategorySchema },
    ]),
    AuthJwtModule,
  ],
  controllers: [CategoryController],
  providers: [
    CategoryRepositoryImpl,
    {
      provide: CATEGORY_REPOSITORY,
      useExisting: CategoryRepositoryImpl,
    },
    CreateCategoryHandler,
    UpdateCategoryHandler,
    SoftDeleteCategoryHandler,
    ChangeCategoryStatusHandler,
    GetActiveCategoriesHandler,
    GetCategoryByIdHandler,
    GetCategoryTreeHandler,
  ],
  exports: [CategoryRepositoryImpl, CATEGORY_REPOSITORY, MongooseModule],
})
export class CategoryModule {}
