/**
 * Command = “lệnh” thay đổi trạng thái; tách khỏi HTTP body để handler không phụ thuộc Nest DTO.
 */
export class UpdateProfileCommand {
  constructor(
    readonly userId: string,
    readonly fullName?: string,
    readonly dateOfBirth?: Date,
    readonly avatar?: string,
  ) {}
}
