import { Module } from '@nestjs/common';
import {
  CategoryDocument,
  CategorySchema,
} from './infrastructure/persistence/category.orm-entity';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CreateCategoryHandler } from './application/commands/create-category/create-category.handler';
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
  ],
  exports: [CategoryRepositoryImpl, MongooseModule],
})
export class CategoryModule {}
