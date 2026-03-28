import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './user.orm-entity';
import { Model } from 'mongoose';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: userId }).exec();
  }

  async save(user: UserDocument): Promise<void> {
    if (user._id == null) {
      throw new NotFoundException(`Không tìm thấy user`);
    }
    const result = await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          fullName: user.fullName,
          avatar: user.avatar,
          dateOfBirth: user.dateOfBirth,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException(`Không tìm thấy user`);
    }
  }

  async create(user: UserDocument): Promise<UserDocument> {
    return this.userModel.create({
      fullName: user.fullName,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
    });
  }
}
