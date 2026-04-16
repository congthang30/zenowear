import { Address } from '../../domain/entities/address.entity';
import type { AddressDocument } from './address.orm-entity';

export class AddressMapper {
  static toDomain(doc: AddressDocument): Address {
    return Address.reconstitute({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      fullName: doc.fullName,
      phone: doc.phone,
      line1: doc.line1,
      line2: doc.line2,
      district: doc.district,
      city: doc.city,
      country: doc.country,
    });
  }
}
