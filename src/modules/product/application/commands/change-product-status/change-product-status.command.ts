import { ProductStatus } from '../../../domain/enum/productStatus.enum';

export class ChangeProductStatusCommand {
  constructor(
    readonly id: string,
    readonly status: ProductStatus,
  ) {}
}
