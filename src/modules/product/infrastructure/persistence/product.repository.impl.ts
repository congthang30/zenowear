import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { ClientSession, Connection, PipelineStage } from 'mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from '../../domain/entities/product-variant.entity';
import {
  IProductRepository,
  ProductSearchCriteria,
} from '../../domain/repositories/product.repository.interface';
import { ProductDocument } from './product.orm-entity';
import { ProductVariantDocument } from './product-variant.orm-entity';
import { ProductMapper } from './product.mapper';
import { ProductVariantMapper } from './product-variant.mapper';
import { ProductStatus } from '../../domain/enum/productStatus.enum';

function buildProductListMatch(criteria: ProductSearchCriteria): Record<string, unknown> {
  const { search, brandId, categoryId, catalogOnly } = criteria;
  const parts: Record<string, unknown>[] = [
    { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
  ];
  if (catalogOnly) {
    parts.push({ status: ProductStatus.ACTIVE });
  }
  if (brandId && Types.ObjectId.isValid(brandId)) {
    parts.push({ brandId: new Types.ObjectId(brandId) });
  }
  if (categoryId && Types.ObjectId.isValid(categoryId)) {
    parts.push({ categoryId: new Types.ObjectId(categoryId) });
  }
  if (search?.trim()) {
    parts.push({ $text: { $search: search.trim() } });
  }
  return parts.length === 1 ? parts[0] : { $and: parts };
}

@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariantDocument.name)
    private readonly productVariantModel: Model<ProductVariantDocument>,
  ) {}

  private toProductSetPayload(data: ReturnType<typeof ProductMapper.toPersistence>) {
    return {
      ...data,
      brandId: new Types.ObjectId(data.brandId),
      categoryId: new Types.ObjectId(data.categoryId),
    };
  }

  private async persistProduct(
    product: Product,
    session?: ClientSession,
  ): Promise<string> {
    const data = ProductMapper.toPersistence(product);
    const id = product.id
      ? new Types.ObjectId(product.id)
      : new Types.ObjectId();

    await this.productModel.updateOne(
      { _id: id },
      {
        $set: this.toProductSetPayload(data),
        $setOnInsert: { _id: id },
      },
      { upsert: true, ...(session ? { session } : {}) },
    );

    return id.toString();
  }

  private async persistVariants(
    variants: ProductVariant[],
    session?: ClientSession,
  ): Promise<void> {
    if (variants.length === 0) return;

    const operations = variants.map((variant) => {
      const data = ProductVariantMapper.toPersistence(variant);
      const id = variant.id
        ? new Types.ObjectId(variant.id)
        : new Types.ObjectId();

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

    await this.productVariantModel.bulkWrite(operations, {
      ...(session ? { session } : {}),
    });
  }

  async save(product: Product): Promise<string> {
    return this.persistProduct(product);
  }

  async saveProductWithVariants(
    product: Product,
    buildVariants: (productId: string) => ProductVariant[],
  ): Promise<string> {
    const session = await this.connection.startSession();
    let productId = '';
    try {
      await session.withTransaction(async () => {
        productId = await this.persistProduct(product, session);
        const variants = buildVariants(productId);
        await this.persistVariants(variants, session);
      });
      return productId;
    } finally {
      await session.endSession();
    }
  }

  async saveVariant(variant: ProductVariant): Promise<void> {
    const data = ProductVariantMapper.toPersistence(variant);
    const id = variant.id
      ? new Types.ObjectId(variant.id)
      : new Types.ObjectId();

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
    await this.persistVariants(variants);
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

  async existsBySlug(slug: string, excludeProductId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = { slug };
    if (excludeProductId && Types.ObjectId.isValid(excludeProductId)) {
      filter._id = { $ne: new Types.ObjectId(excludeProductId) };
    }
    return (await this.productModel.countDocuments(filter)) > 0;
  }

  async existsByBarcode(
    barcode: string,
    excludeProductId?: string,
  ): Promise<boolean> {
    const filter: Record<string, unknown> = { barcode };
    if (excludeProductId && Types.ObjectId.isValid(excludeProductId)) {
      filter._id = { $ne: new Types.ObjectId(excludeProductId) };
    }
    return (await this.productModel.countDocuments(filter)) > 0;
  }

  async existsBySku(sku: string, excludeVariantId?: string): Promise<boolean> {
    const filter: Record<string, unknown> = { sku };
    if (excludeVariantId && Types.ObjectId.isValid(excludeVariantId)) {
      filter._id = { $ne: new Types.ObjectId(excludeVariantId) };
    }
    return (await this.productVariantModel.countDocuments(filter)) > 0;
  }

  async findVariantById(id: string): Promise<ProductVariant | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.productVariantModel.findById(id).lean();
    if (!doc) return null;
    return ProductVariantMapper.toDomain(
      doc as unknown as ProductVariantDocument,
    );
  }

  async findVariantsByProductId(
    productId: string,
    options?: { includeDeleted?: boolean },
  ): Promise<ProductVariant[]> {
    if (!Types.ObjectId.isValid(productId)) return [];
    const filter: Record<string, unknown> = {
      productId: new Types.ObjectId(productId),
    };
    if (!options?.includeDeleted) {
      filter.$or = [{ deletedAt: null }, { deletedAt: { $exists: false } }];
    }
    const docs = await this.productVariantModel
      .find(filter)
      .sort({ createdAt: 1 })
      .lean();
    return docs.map((doc) =>
      ProductVariantMapper.toDomain(doc as unknown as ProductVariantDocument),
    );
  }

  async search(
    criteria: ProductSearchCriteria,
  ): Promise<{ data: Product[]; total: number }> {
    const { page, limit, minPrice, maxPrice, search } = criteria;
    const skip = (page - 1) * limit;

    const match = buildProductListMatch(criteria);

    const hasPrice = minPrice != null || maxPrice != null;
    const variantColl = this.productVariantModel.collection.name;

    if (!hasPrice) {
      const q = this.productModel.find(match);
      if (search?.trim()) {
        q.sort({ score: { $meta: 'textScore' } } as unknown as Record<
          string,
          1 | -1
        >);
      } else {
        q.sort({ updatedAt: -1 });
      }
      const [docs, total] = await Promise.all([
        q.skip(skip).limit(limit).lean(),
        this.productModel.countDocuments(match),
      ]);
      return {
        data: docs.map((doc) =>
          ProductMapper.toDomain(doc as unknown as ProductDocument),
        ),
        total,
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $lookup: {
          from: variantColl,
          let: { pid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$productId', '$$pid'] },
                $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
              },
            },
          ],
          as: 'vars',
        },
      },
      { $addFields: { minPrice: { $min: '$vars.price' } } },
      { $match: { minPrice: { $type: 'number' } } },
    ];

    if (minPrice != null) {
      pipeline.push({ $match: { minPrice: { $gte: minPrice } } });
    }
    if (maxPrice != null) {
      pipeline.push({ $match: { minPrice: { $lte: maxPrice } } });
    }

    if (search?.trim()) {
      pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
    } else {
      pipeline.push({ $sort: { updatedAt: -1 } });
    }

    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'c' }],
      },
    });

    const agg = await this.productModel.aggregate(pipeline);
    const row = agg[0] as {
      data: ProductDocument[];
      total: { c: number }[];
    };
    const data = (row?.data ?? []).map((doc) =>
      ProductMapper.toDomain(doc as unknown as ProductDocument),
    );
    const total = row?.total?.[0]?.c ?? 0;
    return { data, total };
  }

  async incrementViewCount(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.productModel.updateOne(
      {
        _id: new Types.ObjectId(id),
        status: ProductStatus.ACTIVE,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      },
      { $inc: { viewCount: 1 } },
    );
    return res.modifiedCount > 0;
  }

  async clearDefaultVariantsExcept(
    productId: string,
    exceptVariantId: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(exceptVariantId)) {
      return;
    }
    await this.productVariantModel.updateMany(
      {
        productId: new Types.ObjectId(productId),
        _id: { $ne: new Types.ObjectId(exceptVariantId) },
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
      },
      { $set: { isDefault: false } },
    );
  }
}
