import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from '../../address-repository.token';
import type { IAddressRepository } from '../../../domain/repositories/address.repository.interface';
import { Address } from '../../../domain/entities/address.entity';
import { CreateAddressCommand } from './create-address.command';

@Injectable()
export class CreateAddressHandler {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(command: CreateAddressCommand): Promise<{ id: string }> {
    const entity = Address.create(command.userId, {
      fullName: command.fullName,
      phone: command.phone,
      line1: command.line1,
      city: command.city,
      line2: command.line2,
      district: command.district,
      country: command.country,
    });
    const id = await this.addressRepository.create(entity);
    return { id };
  }
}
