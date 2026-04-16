export class GetUserOrdersQuery {
  constructor(
    readonly userId: string,
    readonly page: number,
    readonly limit: number,
  ) {}
}
