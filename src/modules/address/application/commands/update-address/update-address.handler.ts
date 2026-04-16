import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADDRESS_REPOSITORY } from '../../address-repository.token';
import type { IAddressRepository } from '../../../domain/repositories/address.repository.interface';
import { UpdateAddressCommand } from './update-address.command';

@Injectable()
export class UpdateAddressHandler {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(command: UpdateAddressCommand): Promise<void> {
    const p = command.patch;
    if (
      p.fullName === undefined &&
      p.phone === undefined &&
      p.line1 === undefined &&
      p.line2 === undefined &&
      p.district === undefined &&
      p.city === undefined &&
      p.country === undefined
    ) {
      throw new BadRequestException('Cần ít nhất một trường để cập nhật');
    }

    const addr = await this.addressRepository.findByIdAndUserId(
      command.addressId,
      command.userId,
    );
    if (!addr) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }
    addr.update(p);
    await this.addressRepository.save(addr);
  }
}
