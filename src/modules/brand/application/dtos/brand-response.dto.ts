import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Brand } from '../../domain/entities/brand.entity';
import { BrandStatus } from '../../domain/enum/brand-status.enum';

export class BrandResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id!: string;

  @ApiProperty({ example: 'samsung' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://res.cloudinary.com/demo/image/upload/v1/logo.png',
  })
  logo!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Thương hiệu điện tử Hàn Quốc',
  })
  description!: string | null;

  @ApiProperty({ enum: BrandStatus })
  status!: BrandStatus;

  static fromEntity(b: Brand): BrandResponseDto {
    if (!b.id) {
      throw new Error('Brand chưa có id');
    }
    return {
      id: b.id,
      name: b.brandName.value,
      logo: b.logo,
      description: b.description,
      status: b.status,
    };
  }
}
