const parseList = (value: string | undefined, fallback: string[]): string[] => {
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  databaseUrl: process.env.DATABASE_URL,
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '900s',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  },
  erpSimulation: {
    failureRate: Number(process.env.ERP_SIMULATION_FAILURE_RATE ?? '0.3'),
    minDelayMs: Number(process.env.ERP_SIMULATION_MIN_DELAY_MS ?? '800'),
    maxDelayMs: Number(process.env.ERP_SIMULATION_MAX_DELAY_MS ?? '2500'),
  },
  idempotency: {
    ttlSeconds: parseInt(process.env.IDEMPOTENCY_TTL_SECONDS ?? '600', 10),
  },
  productsCache: {
    ttlSeconds: parseInt(process.env.PRODUCTS_CACHE_TTL_SECONDS ?? '60', 10),
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '30', 10),
  },
  circuitBreaker: {
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD ?? '5', 10),
    resetTimeoutMs: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS ?? '60000', 10),
  },
  security: {
    cors: {
      allowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS, ['http://localhost:3000']),
      allowedHeaders: parseList(process.env.CORS_ALLOWED_HEADERS, [
        'Accept',
        'Accept-Language',
        'Content-Language',
        'Authorization',
        'Content-Type',
        'Idempotency-Key',
        'Request-Id',
      ]),
      exposedHeaders: parseList(process.env.CORS_EXPOSED_HEADERS, [
        'Request-Id',
        'Retry-After',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ]),
      methods: parseList(process.env.CORS_ALLOWED_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
      allowCredentials: parseBoolean(process.env.CORS_ALLOW_CREDENTIALS, true),
      maxAge: parseInt(process.env.CORS_MAX_AGE ?? '600', 10),
    },
    headers: {
      hsts: {
        maxAge: parseInt(process.env.SECURITY_HSTS_MAX_AGE ?? '15552000', 10),
        includeSubDomains: parseBoolean(process.env.SECURITY_HSTS_INCLUDE_SUBDOMAINS, true),
        preload: parseBoolean(process.env.SECURITY_HSTS_PRELOAD, false),
      },
      referrerPolicy: process.env.SECURITY_REFERRER_POLICY ?? 'no-referrer',
    },
  },
});
