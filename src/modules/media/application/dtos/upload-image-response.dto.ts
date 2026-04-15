import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  url!: string;

  @ApiProperty({ example: 'zenowear/products/abc123' })
  publicId!: string;

  @ApiProperty({ example: 800 })
  width!: number;

  @ApiProperty({ example: 600 })
  height!: number;

  @ApiProperty({ example: 'jpg' })
  format!: string;
}
