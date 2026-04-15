import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

export class ChangeBrandStatusDto {
  @ApiProperty({ enum: BrandStatus, example: BrandStatus.ACTIVE })
  @IsEnum(BrandStatus)
  @IsNotEmpty()
  status!: BrandStatus;
}
