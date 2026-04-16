import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { IdentityListEntry } from '../../domain/repositories/identity.repository';
import { IdentityRepository } from '../../domain/repositories/identity.repository';
import { IdentityCredential } from '../../domain/entities/identity-credential.entity';
import { IdentityDocument } from './identity.orm-entity';
import { IdentityMapper } from './identity.mapper';
import type { AccountStatus } from '../../domain/enum/account-status.enum';
import type { RoleAccount } from '../../domain/enum/role.enum';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

  async findEntryByUserId(id: string): Promise<IdentityListEntry | null> {
    const doc = await this.identityModel.findOne({ userId: id }).lean().exec();
    if (!doc) {
      return null;
    }
    return {
      credential: IdentityMapper.toDomain(doc as IdentityDocument),
      createdAt: (doc as { createdAt?: Date }).createdAt,
      updatedAt: (doc as { updatedAt?: Date }).updatedAt,
    };
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

  async findPaged(params: {
    skip: number;
    limit: number;
    emailContains?: string;
    role?: RoleAccount;
    accountStatus?: AccountStatus;
  }): Promise<{ items: IdentityListEntry[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.emailContains?.trim()) {
      filter.email = new RegExp(escapeRegex(params.emailContains.trim()), 'i');
    }
    if (params.role !== undefined) {
      filter.role = params.role;
    }
    if (params.accountStatus !== undefined) {
      filter.accountStatus = params.accountStatus;
    }

    const [docs, total] = await Promise.all([
      this.identityModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(params.skip)
        .limit(params.limit)
        .lean()
        .exec(),
      this.identityModel.countDocuments(filter).exec(),
    ]);

    const items: IdentityListEntry[] = docs.map((doc) => ({
      credential: IdentityMapper.toDomain(doc as IdentityDocument),
      createdAt: (doc as { createdAt?: Date }).createdAt,
      updatedAt: (doc as { updatedAt?: Date }).updatedAt,
    }));

    return { items, total };
  }
}
