export class ChangeMyPasswordCommand {
  constructor(
    readonly userId: string,
    readonly password: string,
    readonly newPassword: string,
    readonly reNewPass: string,
  ) {}
}
