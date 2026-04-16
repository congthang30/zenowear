import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryDocument } from './category.orm-entity';
import { Model, Types } from 'mongoose';
import { CategoryMapper } from './category.mapper';
import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enum/category-status.enum';

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(
    @InjectModel(CategoryDocument.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.categoryModel.findById(id).lean();
    if (!doc) return null;
    return CategoryMapper.toDomain(doc as unknown as CategoryDocument);
  }

  async findAllActive(): Promise<Category[]> {
    const docs = await this.categoryModel
      .find({ categoryStatus: CategoryStatus.ACTIVE })
      .sort({ categoryName: 1 })
      .lean();
    return docs.map((d) =>
      CategoryMapper.toDomain(d as unknown as CategoryDocument),
    );
  }

  async findAll(): Promise<Category[]> {
    const docs = await this.categoryModel.find().sort({ categoryName: 1 }).lean();
    return docs.map((d) =>
      CategoryMapper.toDomain(d as unknown as CategoryDocument),
    );
  }

  async save(category: Category): Promise<void> {
    const persistence = CategoryMapper.toPersistence(category);
    if (!persistence.id || !Types.ObjectId.isValid(persistence.id)) {
      throw new Error('Category id is required for save');
    }
    await this.categoryModel
      .findByIdAndUpdate(
        persistence.id,
        {
          categoryName: persistence.categoryName,
          categoryStatus: persistence.categoryStatus,
          parentId: persistence.parentId
            ? new Types.ObjectId(persistence.parentId)
            : null,
        },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async create(category: Category): Promise<string> {
    const persistence = CategoryMapper.toPersistence(category);
    const doc = await this.categoryModel.create({
      categoryName: persistence.categoryName,
      categoryStatus: persistence.categoryStatus,
      parentId: persistence.parentId
        ? new Types.ObjectId(persistence.parentId)
        : null,
    });
    return doc._id.toString();
  }
}
