import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressResponseDto {
  @ApiProperty()
  id!: string;
}
