import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdentityRepository } from '../../domain/repositories/identity.repository';
import { IdentityDocument } from './identity.orm-entity';

@Injectable()
export class IdentityRepositoryImpl implements IdentityRepository {
  constructor(
    @InjectModel(IdentityDocument.name)
    private readonly identityModel: Model<IdentityDocument>,
  ) {}

  async findByEmail(email: string): Promise<IdentityDocument | null> {
    return this.identityModel.findOne({ email }).exec();
  }

  async save(identity: IdentityDocument): Promise<void> {
    const result = await this.identityModel
      .updateOne(
        { userId: identity.userId },
        {
          $set: {
            email: identity.email,
            password: identity.password,
            accountStatus: identity.accountStatus,
            failedLoginCount: identity.failedLoginCount,
            lockedAt: identity.lockedAt,
            role: identity.role,
          },
        },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        `Không tìm thấy identity với userId: ${identity.userId}`,
      );
    }
  }

  async create(identity: IdentityDocument): Promise<void> {
    await this.identityModel.create({
      userId: identity.userId,
      email: identity.email,
      password: identity.password,
      accountStatus: identity.accountStatus,
      failedLoginCount: identity.failedLoginCount,
      lockedAt: identity.lockedAt,
      role: identity.role,
    });
  }
}
