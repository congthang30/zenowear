import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

function parseTrustProxy(raw: string | undefined): number | boolean | undefined {
  if (raw == null || raw === '') {
    return undefined;
  }
  const s = raw.trim().toLowerCase();
  if (s === '0' || s === 'false' || s === 'no') {
    return false;
  }
  const n = parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 0) {
    return n;
  }
  /** Chuỗi không phải số: coi như bật 1 hop (an toàn hơn `trust all`) */
  if (s === 'true' || s === 'yes') {
    return 1;
  }
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = configService.get<number>('app.port') ?? 9000;
  const prefix = configService.get<string>('app.globalPrefix') ?? 'api/v1';
  const corsOrigin =
    configService.get<string>('app.corsOrigin') ?? 'http://localhost:3000';

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${prefix}/docs`, app, document);
  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: corsOrigin });

  const trustProxy = parseTrustProxy(
    configService.get<string>('app.trustProxy') ?? undefined,
  );
  if (trustProxy !== undefined && trustProxy !== false) {
    app.set('trust proxy', trustProxy);
  }

  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/${prefix}`);
  console.log(`Swagger running on http://localhost:${port}/${prefix}/docs`);
}
void bootstrap();
