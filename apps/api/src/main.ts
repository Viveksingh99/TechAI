import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

const API_PREFIX = 'api/v1';

async function setupSwagger(app: NestExpressApplication): Promise<void> {
  // Swagger is optional: only wired up when @nestjs/swagger is installed so
  // this API keeps building/running without it.
  const swaggerPackageName = '@nestjs/swagger';

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  try {
    const swagger = await import(swaggerPackageName);
    const { DocumentBuilder, SwaggerModule } = swagger;

    const config = new DocumentBuilder()
      .setTitle('TechAI API')
      .setDescription('Software Agency Management Platform — REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);

    console.log(`Swagger docs available at /${API_PREFIX}/docs`);
  } catch {
    console.log('@nestjs/swagger is not installed — skipping API docs setup.');
  }
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: [
      config.get('frontendUrl', { infer: true }),
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await setupSwagger(app);

  const port = config.get('port', { infer: true });
  await app.listen(port);

  console.log(
    `🚀 TechAI API running on http://localhost:${port}/${API_PREFIX}`,
  );
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start TechAI API', error);
  process.exit(1);
});
