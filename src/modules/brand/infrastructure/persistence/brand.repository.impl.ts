import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';
import { Brand } from '../../domain/entities/brand.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BrandDocument } from './brand.orm-entity';
import { Model } from 'mongoose';
import { BrandMapper } from './brand.mapper';

@Injectable()
export class BrandRepositoryImpl implements BrandRepository {
  constructor(
    @InjectModel(BrandDocument.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}
  async findById(id: string): Promise<Brand | null> {
    const doc = await this.brandModel.findOne({ _id: id }).exec();
    return doc ? BrandMapper.toDomain(doc) : null;
  }

  async create(brand: Brand): Promise<void> {
    await this.brandModel.create(BrandMapper.toPersistence(brand));
  }

  async save(brand: Brand): Promise<void> {
    const persistence = BrandMapper.toPersistence(brand);

    if (persistence.id) {
      await this.brandModel
        .findByIdAndUpdate(
          persistence.id,
          {
            brandName: persistence.brandName,
            brandStatus: persistence.brandStatus,
          },
          { new: true, upsert: false },
        )
        .exec();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = persistence;
      await this.brandModel.create(data);
    }
  }
}
