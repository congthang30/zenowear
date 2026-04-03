export class UpdateProfileCommand {
  constructor(
    readonly userId: string,
    readonly fullName?: string,
    readonly dateOfBirth?: Date,
    readonly avatar?: string,
  ) {}
}
