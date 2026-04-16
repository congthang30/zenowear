export class CreateAddressCommand {
  constructor(
    readonly userId: string,
    readonly fullName: string,
    readonly phone: string,
    readonly line1: string,
    readonly city: string,
    readonly line2?: string,
    readonly district?: string,
    readonly country?: string,
  ) {}
}
