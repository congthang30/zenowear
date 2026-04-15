import { Module } from '@nestjs/common';
import { AuthJwtModule } from '../../common/auth-jwt.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { MediaController } from './presentation/media.controller';

@Module({
  imports: [CloudinaryModule, AuthJwtModule],
  controllers: [MediaController],
})
export class MediaModule {}
