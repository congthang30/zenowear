import { Brand } from '../../domain/entities/brand.entity';
import { BrandStatus } from '../../domain/enum/brand-status.enum';
import { BrandName } from '../../domain/value-objects/brand-name.vo';
import { BrandDocument } from './brand.orm-entity';

export class BrandMapper {
  static toDomain(doc: BrandDocument): Brand {
    return Brand.reconstitute({
      id: doc._id.toString(),
      brandName: BrandName.reconstitute(doc.brandName),
      brandStatus: doc.brandStatus,
      logo: doc.logo ?? null,
      description: doc.description ?? null,
    });
  }

  static toPersistence(entity: Brand): {
    id: string | undefined;
    brandName: string;
    brandStatus: BrandStatus;
    logo: string | null;
    description: string | null;
  } {
    return {
      id: entity.id,
      brandName: entity.brandName.value,
      brandStatus: entity.status,
      logo: entity.logo,
      description: entity.description,
    };
  }
}
