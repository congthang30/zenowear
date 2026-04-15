export class UpdateCategoryCommand {
  constructor(
    readonly id: string,
    readonly name?: string,
    readonly parentId?: string | null,
  ) {}
}
