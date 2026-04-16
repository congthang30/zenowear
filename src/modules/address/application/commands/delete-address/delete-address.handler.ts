import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from '../../address-repository.token';
import type { IAddressRepository } from '../../../domain/repositories/address.repository.interface';
import { DeleteAddressCommand } from './delete-address.command';

@Injectable()
export class DeleteAddressHandler {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(command: DeleteAddressCommand): Promise<void> {
    const ok = await this.addressRepository.deleteByIdAndUserId(
      command.addressId,
      command.userId,
    );
    if (!ok) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }
  }
}
