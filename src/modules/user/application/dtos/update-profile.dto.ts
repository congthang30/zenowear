import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

/** Body client gửi khi cập nhật — chỉ field được phép sửa. */
export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Trần Thị B', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional({ example: '1992-06-20', type: String, format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: 'https://cdn.example/avatar.png',
    maxLength: 2048,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar?: string;
}
