import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty()
  line1!: string;

  @ApiPropertyOptional()
  line2?: string;

  @ApiPropertyOptional()
  district?: string;

  @ApiProperty()
  city!: string;

  @ApiPropertyOptional()
  country?: string;
}

export function toAddressResponseDto(a: {
  id?: string;
  toSnapshot(): {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    district?: string;
    city: string;
    country?: string;
  };
}): AddressResponseDto {
  const s = a.toSnapshot();
  return {
    id: a.id ?? '',
    fullName: s.fullName,
    phone: s.phone,
    line1: s.line1,
    line2: s.line2,
    district: s.district,
    city: s.city,
    country: s.country,
  };
}
