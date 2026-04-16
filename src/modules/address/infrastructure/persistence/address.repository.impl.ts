import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address } from '../../domain/entities/address.entity';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface';
import { AddressDocument } from './address.orm-entity';
import { AddressMapper } from './address.mapper';

@Injectable()
export class AddressRepositoryImpl implements IAddressRepository {
  constructor(
    @InjectModel(AddressDocument.name)
    private readonly model: Model<AddressDocument>,
  ) {}

  async create(address: Address): Promise<string> {
    const snap = address.toSnapshot();
    const doc = await this.model.create({
      userId: new Types.ObjectId(address.userId),
      fullName: snap.fullName,
      phone: snap.phone,
      line1: snap.line1,
      line2: snap.line2,
      district: snap.district,
      city: snap.city,
      country: snap.country ?? 'VN',
    });
    return doc._id.toString();
  }

  async save(address: Address): Promise<void> {
    const id = address.id;
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new Error('Address id required');
    }
    const snap = address.toSnapshot();
    await this.model.updateOne(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(address.userId) },
      {
        $set: {
          fullName: snap.fullName,
          phone: snap.phone,
          line1: snap.line1,
          line2: snap.line2,
          district: snap.district,
          city: snap.city,
          country: snap.country ?? 'VN',
        },
      },
    );
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Address | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return null;
    }
    const doc = await this.model
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .lean();
    if (!doc) return null;
    return AddressMapper.toDomain(doc as AddressDocument);
  }

  async listByUserId(userId: string): Promise<Address[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const docs = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();
    return docs.map((d) => AddressMapper.toDomain(d as AddressDocument));
  }

  async deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return false;
    }
    const res = await this.model.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return res.deletedCount > 0;
  }
}
