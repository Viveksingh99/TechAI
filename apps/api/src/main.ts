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

  app.use(
    helmet({
      // Allow the Next.js app (different port) to read API responses.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  const frontendUrl = config.get('frontendUrl', { infer: true });
  const localOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Allow extra comma-separated origins via CORS_ORIGINS (useful for Vercel previews)
  const extraOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = new Set(
    [...localOrigins, ...extraOrigins].filter(Boolean),
  );

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Non-browser clients (curl, server-to-server) send no Origin
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      // Allow any Vercel deployment / preview URL
      try {
        const host = new URL(origin).hostname;
        if (host.endsWith('.vercel.app') || host === 'vercel.app') {
          callback(null, true);
          return;
        }
      } catch {
        // ignore invalid origin
      }
      callback(null, false);
    },
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
