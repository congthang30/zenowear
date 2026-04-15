import { BrandStatus } from '../../../domain/enum/brand-status.enum';

export class ChangeBrandStatusCommand {
  constructor(
    readonly id: string,
    readonly status: BrandStatus,
  ) {}
}
