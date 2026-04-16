import { Inject, Injectable } from '@nestjs/common';
import { IDENTITY_REPOSITORY } from '../../../../identity/application/identity-repository.token';
import type { IdentityRepository } from '../../../../identity/domain/repositories/identity.repository';
import { USER_REPOSITORY } from '../../../../user/application/user-repository.token';
import type { UserRepository } from '../../../../user/domain/repositories/user.repository';
import type { AdminUserQueryDto } from '../../dtos/admin-user-query.dto';
import {
  AdminUserListItemDto,
  AdminUserListResponseDto,
} from '../../dtos/admin-user-response.dto';

@Injectable()
export class ListAdminUsersHandler {
  constructor(
    @Inject(IDENTITY_REPOSITORY)
    private readonly identityRepository: IdentityRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: AdminUserQueryDto): Promise<AdminUserListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const { items, total } = await this.identityRepository.findPaged({
      skip,
      limit,
      emailContains: query.email,
      role: query.role,
      accountStatus: query.accountStatus,
    });

    const userIds = items.map((e) => e.credential.userId);
    const profiles = await this.userRepository.findByUserIds(userIds);
    const profileById = new Map(
      profiles.map((p) => [p.assertId(), p] as const),
    );

    const listItems: AdminUserListItemDto[] = items.map((row) => {
      const c = row.credential;
      const profile = profileById.get(c.userId);
      const item = new AdminUserListItemDto();
      item.userId = c.userId;
      item.email = c.email.value;
      item.role = c.role;
      item.accountStatus = c.accountStatus;
      item.fullName = profile?.fullName.value;
      item.avatar = profile?.avatar;
      item.createdAt = row.createdAt;
      item.updatedAt = row.updatedAt;
      return item;
    });

    const res = new AdminUserListResponseDto();
    res.items = listItems;
    res.total = total;
    res.page = page;
    res.limit = limit;
    return res;
  }
}
