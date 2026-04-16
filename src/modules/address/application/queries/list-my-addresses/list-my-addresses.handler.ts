import { Inject, Injectable } from '@nestjs/common';
import { ADDRESS_REPOSITORY } from '../../address-repository.token';
import type { IAddressRepository } from '../../../domain/repositories/address.repository.interface';
import { ListMyAddressesQuery } from './list-my-addresses.query';
import {
  AddressResponseDto,
  toAddressResponseDto,
} from '../../dtos/address-response.dto';

@Injectable()
export class ListMyAddressesHandler {
  constructor(
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  async execute(query: ListMyAddressesQuery): Promise<AddressResponseDto[]> {
    const list = await this.addressRepository.listByUserId(query.userId);
    return list.map((a) => toAddressResponseDto(a));
  }
}
