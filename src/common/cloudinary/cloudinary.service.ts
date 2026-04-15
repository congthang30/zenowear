import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
};

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rawUrl = this.config.get<string>('cloudinary.url')?.trim() ?? '';
    const cloudName = this.config.get<string>('cloudinary.cloudName')?.trim() ?? '';
    const apiKey = this.config.get<string>('cloudinary.apiKey')?.trim() ?? '';
    const apiSecret = this.config.get<string>('cloudinary.apiSecret')?.trim() ?? '';

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.configured = true;
      this.logger.log(
        'Cloudinary: CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET',
      );
      return;
    }

    const urlLooksBroken = /[<>]/.test(rawUrl);
    if (rawUrl && urlLooksBroken) {
      this.logger.warn(
        'CLOUDINARY_URL có ký tự < > (placeholder) — bỏ dấu <> hoặc xóa dòng này và chỉ dùng CLOUDINARY_CLOUD_NAME + API_KEY + API_SECRET',
      );
    }

    if (rawUrl && !urlLooksBroken && rawUrl.startsWith('cloudinary://')) {
      cloudinary.config({ cloudinary_url: rawUrl, secure: true });
      this.configured = true;
      this.logger.log('Cloudinary: CLOUDINARY_URL');
      return;
    }

    this.logger.warn(
      'Thiếu Cloudinary: đặt đủ CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET hoặc CLOUDINARY_URL hợp lệ (cloudinary://KEY:SECRET@CLOUD_NAME, không dùng <>)',
    );
  }

  private ensureConfigured() {
    if (!this.configured) {
      throw new InternalServerErrorException(
        'Chưa cấu hình Cloudinary (CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME + API_KEY + API_SECRET)',
      );
    }
  }

  async uploadImageBuffer(
    buffer: Buffer,
    opts?: { folder?: string; publicId?: string },
  ): Promise<CloudinaryUploadResult> {
    this.ensureConfigured();
    const defaultFolder = this.config.get<string>('cloudinary.uploadFolder');
    const folder = opts?.folder ?? defaultFolder ?? 'zenowear';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          ...(opts?.publicId ? { public_id: opts.publicId } : {}),
        },
        (err, result) => {
          if (err || !result) {
            this.logger.error(err?.message ?? 'Upload failed');
            reject(
              err ??
                new InternalServerErrorException('Cloudinary không trả kết quả'),
            );
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width ?? 0,
            height: result.height ?? 0,
            format: result.format ?? '',
          });
        },
      );
      stream.end(buffer);
    });
  }
}
