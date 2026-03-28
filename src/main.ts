import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(port);

  console.log(`Server running on http://localhost:${port}/${prefix}`);
  console.log(`Swagger running on http://localhost:${port}/${prefix}/docs`);
}
void bootstrap();
