import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument } from './category.orm-entity';
import { Model } from 'mongoose';
import { CategoryMapper } from './category.mapper';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    @InjectModel(CategoryDocument.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    const doc = await this.categoryModel.findOne({ _id: id }).exec();
    return doc ? CategoryMapper.toDomain(doc) : null;
  }

  async save(category: Category): Promise<void> {
    const persistence = CategoryMapper.toPersistence(category);

    if (persistence.id) {
      await this.categoryModel
        .findByIdAndUpdate(
          persistence.id,
          {
            categoryName: persistence.categoryName,
            categoryStatus: persistence.categoryStatus,
          },
          { new: true, upsert: false },
        )
        .exec();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = persistence;
      await this.categoryModel.create(data);
    }
  }

  async create(category: Category): Promise<void> {
    await this.categoryModel.create(CategoryMapper.toPersistence(category));
  }
}
