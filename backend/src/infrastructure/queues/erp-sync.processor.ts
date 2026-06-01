import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { CheckoutResponseStatus } from '@application/checkout/create-checkout.command';
import { CircuitBreakerService } from '@application/ports/circuit-breaker';
import { ErpGateway } from '@application/ports/erp-gateway';
import { IdempotencyStore } from '@application/ports/idempotency-store';
import { AppLogger } from '@application/ports/logger';
import { TelemetryService } from '@application/ports/telemetry';
import { ProductsCache } from '@application/products/products-cache';
import { OrderStatus } from '@domain/order/order-status.enum';
import { OrderRepository } from '@domain/order/order.repository';
import { ProductRepository } from '@domain/product/product.repository';
import { TOKENS } from '@shared/tokens';

interface ErpSyncJobData {
  orderId: string;
  productId: string;
  quantity: number;
  customerId: string;
  idempotencyKey: string;
}

export class ErpSyncProcessor {
  private get ttlSeconds(): number {
    return Number(this.configService.get('idempotency.ttlSeconds', 600));
  }

  constructor(
    @Inject(TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(TOKENS.ERP_GATEWAY)
    private readonly erpGateway: ErpGateway,
    @Inject(TOKENS.IDEMPOTENCY_STORE)
    private readonly idempotencyStore: IdempotencyStore,
    @Inject(TOKENS.PRODUCTS_CACHE)
    private readonly productsCache: ProductsCache,
    @Inject(TOKENS.LOGGER)
    private readonly logger: AppLogger,
    @Inject(TOKENS.CIRCUIT_BREAKER)
    private readonly circuitBreaker: CircuitBreakerService,
    @Inject(TOKENS.TELEMETRY)
    private readonly telemetry: TelemetryService,
    private readonly configService: ConfigService,
  ) {}

  async process(job: Job<ErpSyncJobData>): Promise<void> {
    const { orderId, productId, quantity, idempotencyKey } = job.data;
    this.logger.info('Processing ERP sync job', { orderId, jobId: job.id });

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.warn('Order not found during ERP sync', { orderId });
      return;
    }

    if (!(await this.circuitBreaker.canExecute('erp:global'))) {
      this.logger.warn('ERP circuit breaker open, aborting sync', { orderId });
      await this.circuitBreaker.recordFailure('erp:global');
      await this.handleFailure(
        orderId,
        productId,
        quantity,
        idempotencyKey,
        order!,
        'ERP temporariamente indisponível.',
      );
      return;
    }

    const start = Date.now();
    try {
      await this.erpGateway.processOrder({
        orderId: order.id,
        customerId: order.customerId,
        items: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
        totalCents: order.totalCents,
      });

      order.markSuccess();
      await this.orderRepository.update(order);
      await this.idempotencyStore.set(
        idempotencyKey,
        {
          status: CheckoutResponseStatus.SUCCESS,
          orderId: order.id,
          orderStatus: OrderStatus.SUCCESS,
          message: 'Pedido confirmado com sucesso! 🎉',
        },
        this.ttlSeconds,
      );
      await this.productsCache.invalidateAll();
      this.logger.info('Order synchronized with ERP', { orderId });
      await this.circuitBreaker.recordSuccess('erp:global');
      this.telemetry.incrementCounter('checkout_total', { labels: { status: 'synced' } });
      this.telemetry.observeDuration('erp_sync_duration', {
        durationMs: Date.now() - start,
        labels: { result: 'success' },
      });
    } catch (error) {
      this.logger.error('ERP sync failed', { orderId, error: (error as Error).message });
      await this.circuitBreaker.recordFailure('erp:global');
      this.telemetry.incrementCounter('checkout_total', { labels: { status: 'failed_sync' } });
      this.telemetry.observeDuration('erp_sync_duration', {
        durationMs: Date.now() - start,
        labels: { result: 'failed' },
      });
      await this.handleFailure(
        orderId,
        productId,
        quantity,
        idempotencyKey,
        order!,
        'ERP indisponível. Tente novamente.',
      );
      throw error;
    }
  }

  private async handleFailure(
    orderId: string,
    productId: string,
    quantity: number,
    idempotencyKey: string,
    order: NonNullable<Awaited<ReturnType<OrderRepository['findById']>>>,
    message: string,
  ): Promise<void> {
    if (order.status !== OrderStatus.FAILED) {
      await this.productRepository.releaseStock(productId, quantity);
    }
    order.markFailure(message);
    await this.orderRepository.update(order);
    await this.idempotencyStore.set(
      idempotencyKey,
      {
        status: CheckoutResponseStatus.TECHNICAL_FAILURE,
        orderId,
        orderStatus: OrderStatus.FAILED,
        message,
      },
      this.ttlSeconds,
    );
    await this.productsCache.invalidateAll();
  }

  onFailed(job: Job<ErpSyncJobData>, err: Error) {
    this.logger.error('ERP sync job failed', { jobId: job.id, error: err.message });
  }

  onCompleted(job: Job<ErpSyncJobData>) {
    this.logger.info('ERP sync job completed', { jobId: job.id });
  }
}
