import { CheckoutResponseStatus, CreateCheckoutCommand } from '@application/checkout/create-checkout.command';
import { OrderRepository } from '@domain/order/order.repository';
import { ProductRepository } from '@domain/product/product.repository';
import { IdempotencyStore } from '@application/ports/idempotency-store';
import { LockManager } from '@application/ports/lock-manager';
import { AppLogger } from '@application/ports/logger';
import { Product } from '@domain/product/product.entity';
import { ConfigService } from '@nestjs/config';
import { EnqueueErpSyncCommand } from '@application/checkout/enqueue-erp-sync.command';
import { TelemetryService } from '@application/ports/telemetry';

const createProduct = (id = 'product-1') =>
  Product.create(
    {
      name: 'Capinha',
      description: 'Proteção',
      sku: 'SKU-1',
      priceCents: 1000,
      stock: 10,
      isActive: true,
    },
    id,
  );

describe('CreateCheckoutCommand', () => {
  const productRepository: jest.Mocked<ProductRepository> = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    releaseStock: jest.fn(),
    reserveStock: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<ProductRepository>;
  const orderRepository: jest.Mocked<OrderRepository> = {
    findById: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<OrderRepository>;
  const idempotencyStore: jest.Mocked<IdempotencyStore> = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const lockManager: jest.Mocked<LockManager> = {
    acquire: jest.fn(),
    release: jest.fn(),
  };
  const logger: jest.Mocked<AppLogger> = {
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  const telemetry: jest.Mocked<TelemetryService> = {
    incrementCounter: jest.fn(),
    observeDuration: jest.fn(),
    startSpan: jest.fn().mockReturnValue(jest.fn()),
  } as unknown as jest.Mocked<TelemetryService>;
  const enqueueErpSync: jest.Mocked<EnqueueErpSyncCommand> = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<EnqueueErpSyncCommand>;
  const configService = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'idempotency.ttlSeconds') {
        return 120;
      }
      return defaultValue;
    }),
  } as unknown as ConfigService;

  const command = new CreateCheckoutCommand(
    productRepository,
    orderRepository,
    idempotencyStore,
    lockManager,
    logger,
    telemetry,
    enqueueErpSync,
    configService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    lockManager.acquire.mockResolvedValue(true);
    lockManager.release.mockResolvedValue();
    idempotencyStore.get.mockResolvedValue(null);
    productRepository.findById.mockResolvedValue(createProduct());
    productRepository.reserveStock.mockResolvedValue(createProduct());
    productRepository.releaseStock.mockResolvedValue(createProduct());
    orderRepository.save.mockResolvedValue();
    orderRepository.update.mockResolvedValue();
    enqueueErpSync.execute.mockResolvedValue();
  });

  it('deve concluir checkout com sucesso e enfileirar sincronização', async () => {
    const result = await command.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 2,
      idempotencyKey: 'key-1',
    });

    expect(result.status).toBe(CheckoutResponseStatus.SUCCESS);
    expect(result.orderId).toBeDefined();
    expect(orderRepository.save).toHaveBeenCalledTimes(1);
    expect(enqueueErpSync.execute).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: expect.any(String), productId: 'product-1', quantity: 2 }),
    );
    expect(idempotencyStore.set).toHaveBeenCalledWith('key-1', expect.any(Object), 120);
  });

  it('deve retornar resposta idempotente se chave já existir', async () => {
    idempotencyStore.get.mockResolvedValue({
      key: 'key-1',
      createdAt: new Date(),
      response: {
        status: CheckoutResponseStatus.SUCCESS,
        orderId: 'order-123',
        message: 'ok',
      },
    });

    const result = await command.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 1,
      idempotencyKey: 'key-1',
    });

    expect(result.duplicate).toBe(true);
    expect(result.orderId).toBe('order-123');
    expect(orderRepository.save).not.toHaveBeenCalled();
    expect(enqueueErpSync.execute).not.toHaveBeenCalled();
  });

  it('deve sinalizar estoque insuficiente sem enfileirar', async () => {
    productRepository.reserveStock.mockRejectedValue(new Error('Insufficient stock'));

    const result = await command.execute({
      customerId: 'customer-1',
      productId: 'product-1',
      quantity: 99,
      idempotencyKey: 'key-2',
    });

    expect(result.status).toBe(CheckoutResponseStatus.INSUFFICIENT_STOCK);
    expect(orderRepository.save).not.toHaveBeenCalled();
    expect(enqueueErpSync.execute).not.toHaveBeenCalled();
  });
});
