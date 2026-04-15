export class UpdateBrandCommand {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly logo?: string | null,
    readonly description?: string | null,
  ) {}
}
