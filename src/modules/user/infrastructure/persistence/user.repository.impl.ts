import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserDocument } from './user.orm-entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const doc = await this.userModel.findById(userId).exec();
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async save(user: UserProfile): Promise<void> {
    const id = user.assertId();
    const payload = UserMapper.toPersistence(user);
    const result = await this.userModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { $set: payload },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Không tìm thấy user`);
    }
  }

  async create(user: UserProfile): Promise<UserProfile> {
    const doc = await this.userModel.create(UserMapper.toPersistence(user));
    return UserMapper.toDomain(doc);
  }
}
