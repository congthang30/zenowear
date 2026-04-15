import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class MarkFeaturedDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isFeatured!: boolean;
}
