export class GetProductsQuery {
  constructor(
    readonly page: number,
    readonly limit: number,
    readonly search?: string,
    readonly brandId?: string,
    readonly categoryId?: string,
    readonly minPrice?: number,
    readonly maxPrice?: number,
    readonly catalogOnly = true,
  ) {}
}
