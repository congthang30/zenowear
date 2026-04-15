export class MarkProductFeaturedCommand {
  constructor(
    readonly id: string,
    readonly isFeatured: boolean,
  ) {}
}
