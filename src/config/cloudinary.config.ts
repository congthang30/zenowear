import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  url: process.env.CLOUDINARY_URL?.trim() ?? '',
  cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? '',
  apiKey: process.env.CLOUDINARY_API_KEY?.trim() ?? '',
  apiSecret: process.env.CLOUDINARY_API_SECRET?.trim() ?? '',
  uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? 'zenowear',
}));
