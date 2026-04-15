import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';
import { Brand } from '../../domain/entities/brand.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BrandDocument } from './brand.orm-entity';
import { Model, Types } from 'mongoose';
import { BrandMapper } from './brand.mapper';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

@Injectable()
export class BrandRepositoryImpl implements BrandRepository {
  constructor(
    @InjectModel(BrandDocument.name)
    private readonly brandModel: Model<BrandDocument>,
  ) {}

  async findById(id: string): Promise<Brand | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.brandModel.findById(id).lean();
    if (!doc) return null;
    return BrandMapper.toDomain(doc as unknown as BrandDocument);
  }

  async findByNormalizedName(normalized: string): Promise<Brand | null> {
    const doc = await this.brandModel
      .findOne({ brandName: normalized })
      .lean();
    if (!doc) return null;
    return BrandMapper.toDomain(doc as unknown as BrandDocument);
  }

  async findAllActive(): Promise<Brand[]> {
    const docs = await this.brandModel
      .find({ brandStatus: BrandStatus.ACTIVE })
      .sort({ brandName: 1 })
      .lean();
    return docs.map((d) =>
      BrandMapper.toDomain(d as unknown as BrandDocument),
    );
  }

  async create(brand: Brand): Promise<string> {
    const p = BrandMapper.toPersistence(brand);
    const doc = await this.brandModel.create({
      brandName: p.brandName,
      brandStatus: p.brandStatus,
      logo: p.logo,
      description: p.description,
    });
    return doc._id.toString();
  }

  async save(brand: Brand): Promise<void> {
    const persistence = BrandMapper.toPersistence(brand);
    if (!persistence.id || !Types.ObjectId.isValid(persistence.id)) {
      throw new Error('Brand id is required for save');
    }
    await this.brandModel
      .findByIdAndUpdate(
        persistence.id,
        {
          brandName: persistence.brandName,
          brandStatus: persistence.brandStatus,
          logo: persistence.logo,
          description: persistence.description,
        },
        { new: true },
      )
      .exec();
  }
}
