import { BrandStatus } from '../../../domain/enum/brand-status.enum';

export class CreateBrandCommand {
  constructor(
    readonly brandName: string,
    readonly brandStatus?: BrandStatus,
  ) {}
}
