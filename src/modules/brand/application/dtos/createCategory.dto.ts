import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsEnum } from 'class-validator';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Samsung',
    maxLength: 254,
  })
  @IsString()
  @MaxLength(254)
  brandName!: string;

  @ApiProperty({
    enum: BrandStatus,
    example: BrandStatus.ACTIVE,
  })
  @IsEnum(BrandStatus)
  brandStatus!: BrandStatus;
}
