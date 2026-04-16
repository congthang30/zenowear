import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from './modules/identity/identity.module';
import { UserModule } from './modules/user/user.module';
import jwtConfig from './config/jwt.config';
import cloudinaryConfig from './config/cloudinary.config';
import smtpConfig from './config/smtp.config';
import vnpayConfig from './config/vnpay.config';
import momoConfig from './config/momo.config';
import couponConfig from './config/coupon.config';
import { CategoryModule } from './modules/category/category.module';
import { BrandModule } from './modules/brand/brand.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { MediaModule } from './modules/media/media.module';
import { AddressModule } from './modules/address/address.module';
import { MailModule } from './common/mail/mail.module';
import { UserAdminModule } from './modules/user-admin/user-admin.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        cloudinaryConfig,
        smtpConfig,
        vnpayConfig,
        momoConfig,
        couponConfig,
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    MailModule,
    UserModule,
    IdentityModule,
    UserAdminModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    CartModule,
    AddressModule,
    OrderModule,
    MediaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
