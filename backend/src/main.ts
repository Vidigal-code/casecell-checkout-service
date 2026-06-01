import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet, { HelmetOptions } from 'helmet';
import { AppModule } from '@presentation/app.module';
import { setupSwaggerDocs } from '@presentation/http/docs/swagger.setup';

const API_PREFIX = 'api/v1';
const DEFAULT_PORT = 3001;

interface SecurityCorsConfig {
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  methods: string[];
  allowCredentials: boolean;
  maxAge: number;
}

interface SecurityHeadersConfig {
  hsts: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  referrerPolicy: string;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  configureSecurity(app, configService);
  configureGlobalPipes(app);
  setupSwaggerDocs(app);

  await app.listen(resolvePort(configService));
}

bootstrap();

function configureSecurity(app: INestApplication, configService: ConfigService) {
  app.setGlobalPrefix(API_PREFIX);

  app.enableCors(createCorsOptions(configService));

  const helmetOptions: Partial<HelmetOptions> = {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  };

  const referrerPolicy = configService.get<string>(
    'security.headers.referrerPolicy',
    'no-referrer',
  );
  if (referrerPolicy) {
    type ReferrerPolicyConfig = Extract<HelmetOptions['referrerPolicy'], { policy: unknown }>;
    helmetOptions.referrerPolicy = {
      policy: referrerPolicy as ReferrerPolicyConfig['policy'],
    };
  }

  const nodeEnv = configService.get<string>('nodeEnv', 'development');
  const headersConfig = configService.get<SecurityHeadersConfig['hsts']>('security.headers.hsts');

  if (nodeEnv === 'production' && headersConfig) {
    helmetOptions.hsts = {
      maxAge: headersConfig.maxAge,
      includeSubDomains: headersConfig.includeSubDomains,
      preload: headersConfig.preload,
    };
  }

  app.use(helmet(helmetOptions as HelmetOptions));
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

function resolvePort(configService: ConfigService): number {
  return configService.get<number>('port', DEFAULT_PORT);
}

function createCorsOptions(configService: ConfigService): CorsOptions {
  const corsConfig = configService.get<SecurityCorsConfig>('security.cors');

  if (!corsConfig) {
    return { origin: false };
  }

  const originMatchers = buildOriginMatchers(corsConfig.allowedOrigins);

  return {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (originMatchers.length === 0 || originMatchers.some((matcher) => matcher(requestOrigin))) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${requestOrigin} is not allowed by CORS policy`), false);
    },
    methods: corsConfig.methods,
    credentials: corsConfig.allowCredentials,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders,
    maxAge: corsConfig.maxAge,
  };
}

type OriginMatcher = (origin: string) => boolean;

function buildOriginMatchers(patterns: string[]): OriginMatcher[] {
  if (!patterns || patterns.length === 0) {
    return [];
  }

  return patterns.map((pattern) => {
    if (pattern === '*') {
      return () => true;
    }

    if (pattern === 'null') {
      return (origin: string) => origin === 'null';
    }

    const escapedPattern = escapeForRegex(pattern);
    const regex = new RegExp(`^${escapedPattern.replace(/\\\*/g, '.*')}$`, 'i');
    return (origin: string) => regex.test(origin);
  });
}

function escapeForRegex(value: string): string {
  return value.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
}
