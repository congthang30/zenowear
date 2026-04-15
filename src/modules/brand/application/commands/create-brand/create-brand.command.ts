import { BrandStatus } from '../../../domain/enum/brand-status.enum';

export class CreateBrandCommand {
  constructor(
    readonly name: string,
    readonly logo?: string | null,
    readonly description?: string | null,
    readonly status?: BrandStatus,
  ) {}
}
