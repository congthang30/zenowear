import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductDocument } from './product.orm-entity';
import { ProductVariantDocument } from './product-variant.orm-entity';
import { ProductMapper } from './product.mapper';
import { ProductVariantMapper } from './product-variant.mapper';

@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
  constructor(
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariantDocument.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
  ) {}

  async save(product: Product): Promise<void> {
    const data = ProductMapper.toPersistence(product);
    const id = product.id ? new Types.ObjectId(product.id) : new Types.ObjectId();
    
    await this.productModel.updateOne(
      { _id: id },
      { $set: data, $setOnInsert: { _id: id } },
      { upsert: true }
    );
  }

  async saveVariant(variant: ProductVariant): Promise<void> {
    const data = ProductVariantMapper.toPersistence(variant);
    const id = variant.id ? new Types.ObjectId(variant.id) : new Types.ObjectId();

    await this.productVariantModel.updateOne(
      { _id: id },
      {
        $set: {
          ...data,
          productId: new Types.ObjectId(data.productId),
        },
        $setOnInsert: { _id: id },
      },
      { upsert: true },
    );
  }

  async saveVariants(variants: ProductVariant[]): Promise<void> {
    if (variants.length === 0) return;

    const operations = variants.map((variant) => {
      const data = ProductVariantMapper.toPersistence(variant);
      const id = variant.id ? new Types.ObjectId(variant.id) : new Types.ObjectId();

      return {
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              ...data,
              productId: new Types.ObjectId(data.productId),
            },
            $setOnInsert: { _id: id },
          },
          upsert: true,
        },
      };
    });

    await this.productVariantModel.bulkWrite(operations);
  }

  async findById(id: string): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.productModel.findById(id).lean();
    if (!doc) return null;
    return ProductMapper.toDomain(doc as unknown as ProductDocument);
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    const doc = await this.productModel.findOne({ barcode }).lean();
    if (!doc) return null;
    return ProductMapper.toDomain(doc as unknown as ProductDocument);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.productModel.countDocuments({ slug });
    return count > 0;
  }

  async findVariantById(id: string): Promise<ProductVariant | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.productVariantModel.findById(id).lean();
    if (!doc) return null;
    return ProductVariantMapper.toDomain(doc as unknown as ProductVariantDocument);
  }

  async findVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    if (!Types.ObjectId.isValid(productId)) return [];
    const docs = await this.productVariantModel
      .find({ productId: new Types.ObjectId(productId) })
      .lean();
    return docs.map((doc) => ProductVariantMapper.toDomain(doc as unknown as ProductVariantDocument));
  }

  async findAll(
    skip: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.productModel.find().skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(),
    ]);

    return {
      data: docs.map((doc) => ProductMapper.toDomain(doc as unknown as ProductDocument)),
      total,
    };
  }
}
