export class UpdateAddressCommand {
  constructor(
    readonly userId: string,
    readonly addressId: string,
    readonly patch: {
      fullName?: string;
      phone?: string;
      line1?: string;
      line2?: string;
      district?: string;
      city?: string;
      country?: string;
    },
  ) {}
}
