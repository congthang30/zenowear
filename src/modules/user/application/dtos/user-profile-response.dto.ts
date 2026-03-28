import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDocument } from '../../infrastructure/persistence/user.orm-entity';

/** Dữ liệu trả về cho client (không lộ field nội bộ như _id nếu bạn không muốn). */
export class UserResponseDto {
  @ApiProperty({ example: 'usr_01' })
  userId: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'https://...' })
  avatar?: string;

  static fromDocument(doc: UserDocument): UserResponseDto {
    const dto = new UserResponseDto();
    dto.userId = doc._id?.toString() ?? '';
    dto.fullName = doc.fullName;
    dto.dateOfBirth = doc.dateOfBirth;
    dto.avatar = doc.avatar;
    return dto;
  }
}
