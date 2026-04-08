import { Brand } from '../../domain/entities/brand.entity';
import { BrandStatus } from '../../domain/enum/brand-status.enum';
import { BrandName } from '../../domain/value-objects/brand-name.vo';
import { BrandDocument } from './brand.orm-entity';

export class BrandMapper {
  static toDomain(doc: BrandDocument): Brand {
    return Brand.reconstitute({
      id: doc._id.toString(),
      brandName: BrandName.create(doc.brandName),
      brandStatus: doc.brandStatus,
    });
  }

  static toPersistence(entity: Brand): {
    id: string | undefined;
    brandName: string;
    brandStatus: BrandStatus;
  } {
    return {
      id: entity.Id,
      brandName: entity.brandName.value,
      brandStatus: entity.status,
    };
  }
}
