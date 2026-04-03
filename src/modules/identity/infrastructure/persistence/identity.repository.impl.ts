import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdentityRepository } from '../../domain/repositories/identity.repository';
import { IdentityCredential } from '../../domain/entities/identity-credential.entity';
import { IdentityDocument } from './identity.orm-entity';
import { IdentityMapper } from './identity.mapper';

@Injectable()
export class IdentityRepositoryImpl implements IdentityRepository {
  constructor(
    @InjectModel(IdentityDocument.name)
    private readonly identityModel: Model<IdentityDocument>,
  ) {}

  async findByEmail(email: string): Promise<IdentityCredential | null> {
    const doc = await this.identityModel.findOne({ email }).exec();
    return doc ? IdentityMapper.toDomain(doc) : null;
  }

  async findByIdUser(id: string): Promise<IdentityCredential | null> {
    const doc = await this.identityModel.findOne({ userId: id });
    if (!doc) return null;

    return doc ? IdentityMapper.toDomain(doc) : null;
  }

  async save(identity: IdentityCredential): Promise<void> {
    const payload = IdentityMapper.toPersistence(identity);
    const result = await this.identityModel
      .updateOne(
        { userId: identity.userId },
        {
          $set: {
            email: payload.email,
            password: payload.password,
            accountStatus: payload.accountStatus,
            failedLoginCount: payload.failedLoginCount,
            lockedAt: payload.lockedAt,
            role: payload.role,
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

  async create(identity: IdentityCredential): Promise<void> {
    await this.identityModel.create(IdentityMapper.toPersistence(identity));
  }
}
