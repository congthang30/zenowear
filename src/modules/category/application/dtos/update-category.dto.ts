import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Smartphone' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description:
      'Đặt parent mới (MongoId). Gửi chuỗi rỗng hoặc null qua JSON `null` để gỡ cha — với multipart không dùng route này.',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== '')
  @IsMongoId()
  parentId?: string | null;
}
