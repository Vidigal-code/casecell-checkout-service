import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';
import { AppModule } from '@presentation/app.module';
import { createInMemoryPrisma } from '../utils/in-memory-db';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { REDIS_CLIENT } from '@infrastructure/redis/redis.constants';
import { IdempotencyStore } from '@application/ports/idempotency-store';
import { LockManager } from '@application/ports/lock-manager';
import { TOKENS } from '@shared/tokens';
import { ErpGateway } from '@application/ports/erp-gateway';
import { AppLogger } from '@application/ports/logger';
import { ProductsCache } from '@application/products/products-cache';
import { ListProductsInput } from '@application/products/list-products.query';
import { PaginatedProductsDto } from '@application/products/dto/product.dto';
import { CircuitBreakerService } from '@application/ports/circuit-breaker';
import { TelemetryService } from '@application/ports/telemetry';
import { OrderStatus } from '@domain/order/order-status.enum';
import { CheckoutResponseStatus } from '@application/checkout/create-checkout.command';
import { EnqueueErpSyncCommand } from '@application/checkout/enqueue-erp-sync.command';
import { Queue } from 'bullmq';
import { ErpSyncWorker } from '@infrastructure/queues/erp-sync.worker';

class InMemoryIdempotencyStore implements IdempotencyStore {
  private storage = new Map<string, { response: unknown; createdAt: Date }>();

  async get<T>(key: string) {
    const record = this.storage.get(key);
    return record ? { key, response: record.response as T, createdAt: record.createdAt } : null;
  }

  async set<T>(key: string, response: T, ttlSeconds: number) {
    this.storage.set(key, { response, createdAt: new Date() });
  }
}

class InMemoryLockManager implements LockManager {
  private locks = new Set<string>();

  async acquire(key: string, _ttlMs: number) {
    if (this.locks.has(key)) {
      return false;
    }
    this.locks.add(key);
    return true;
  }

  async release(key: string) {
    this.locks.delete(key);
  }
}

class StubErpGateway implements ErpGateway {
  async processOrder() {
    return { externalOrderId: `ERP-${Date.now()}` };
  }
}

class SilentLogger implements AppLogger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
}

class InMemoryProductsCache implements ProductsCache {
  private cache = new Map<string, PaginatedProductsDto>();

  async get(params: ListProductsInput) {
    return this.cache.get(JSON.stringify(params)) ?? null;
  }

  async set(params: ListProductsInput, data: PaginatedProductsDto) {
    this.cache.set(JSON.stringify(params), data);
  }

  async invalidateAll() {
    this.cache.clear();
  }
}

class NoopCircuitBreaker implements CircuitBreakerService {
  async canExecute(): Promise<boolean> {
    return true;
  }
  async recordSuccess(): Promise<void> {}
  async recordFailure(): Promise<void> {}
}

class NoopTelemetry implements TelemetryService {
  incrementCounter(): void {}
  observeDuration(): void {}
  startSpan(): () => void {
    return () => {};
  }
}

class StubEnqueueErpSyncCommand {
  public jobs: any[] = [];

  async execute(payload: unknown) {
    this.jobs.push(payload);
  }
}

class StubQueue {
  public jobs: any[] = [];
  async add(name: string, payload: unknown) {
    this.jobs.push({ name, payload });
  }
  async close() {}
}

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: Awaited<ReturnType<typeof createInMemoryPrisma>>;
  const idempotencyStore = new InMemoryIdempotencyStore();
  const enqueueStub = new StubEnqueueErpSyncCommand();
  const queueStub = new StubQueue();

  beforeAll(async () => {
    prisma = await createInMemoryPrisma();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(REDIS_CLIENT)
      .useValue({})
      .overrideProvider(TOKENS.IDEMPOTENCY_STORE)
      .useValue(idempotencyStore)
      .overrideProvider(TOKENS.LOCK_MANAGER)
      .useValue(new InMemoryLockManager())
      .overrideProvider(TOKENS.ERP_GATEWAY)
      .useClass(StubErpGateway)
      .overrideProvider(TOKENS.LOGGER)
      .useClass(SilentLogger)
      .overrideProvider(TOKENS.PRODUCTS_CACHE)
      .useClass(InMemoryProductsCache)
      .overrideProvider(TOKENS.CIRCUIT_BREAKER)
      .useClass(NoopCircuitBreaker)
      .overrideProvider(TOKENS.TELEMETRY)
      .useClass(NoopTelemetry)
      .overrideProvider(EnqueueErpSyncCommand)
      .useValue(enqueueStub)
      .overrideProvider(TOKENS.ERP_SYNC_QUEUE)
      .useValue(queueStub as unknown as Queue)
      .overrideProvider(ErpSyncWorker)
      .useValue({ onModuleDestroy: async () => {} })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    const customerId = uuid();
    await prisma.user.create({
      data: {
        id: customerId,
        email: 'customer@test.com',
        passwordHash: await argon2.hash('customer123'),
        role: 'CUSTOMER',
      },
    });

    await prisma.product.create({
      data: {
        id: 'prod-1',
        name: 'Capinha Teste',
        description: 'Proteção e estilo',
        sku: 'SKU-E2E',
        priceCents: 1299,
        stock: 3,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('executa fluxo de login e checkout', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'customer@test.com', password: 'customer123' })
      .expect(200);

    const { accessToken } = loginResponse.body;

    const productsResponse = await request(app.getHttpServer())
      .get('/api/v1/products?page=1&pageSize=10')
      .expect(200);

    expect(productsResponse.body.data).toHaveLength(1);

    const idempotencyKey = uuid();
    const checkoutResponse = await request(app.getHttpServer())
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({ productId: 'prod-1', quantity: 1 })
      .expect(201);

    expect(checkoutResponse.body.status).toBe('SUCCESS');
    const orderId = checkoutResponse.body.orderId;

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SUCCESS' },
    });
    await idempotencyStore.set(idempotencyKey, {
      status: CheckoutResponseStatus.SUCCESS,
      orderId,
      orderStatus: OrderStatus.SUCCESS,
      message: 'Pedido confirmado com sucesso! 🎉',
    }, 600);

    await request(app.getHttpServer())
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
