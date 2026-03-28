export class RegisterCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly rePassword: string,
    readonly fullName: string,
    readonly dateOfBirth: Date,
  ) {}
}
