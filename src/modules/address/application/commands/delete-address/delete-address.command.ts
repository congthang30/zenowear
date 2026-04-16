export class DeleteAddressCommand {
  constructor(
    readonly userId: string,
    readonly addressId: string,
  ) {}
}
