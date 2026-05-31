import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';
import { AppModule } from '@presentation/app.module';
import { setupSwaggerDocs } from '@presentation/http/docs/swagger.setup';

const API_PREFIX = 'api/v1';
const DEFAULT_PORT = 3001;
const CORS_OPTIONS: CorsOptions = { origin: true, credentials: true };

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  configureSecurity(app);
  configureGlobalPipes(app);
  setupSwaggerDocs(app);

  await app.listen(resolvePort());
}

bootstrap();

function configureSecurity(app: INestApplication) {
  app.use(helmet());
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors(CORS_OPTIONS);
}

function configureGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}

function resolvePort(): number {
  return Number(process.env.PORT ?? DEFAULT_PORT);
}
