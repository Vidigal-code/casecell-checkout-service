import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductRepository } from '@domain/product/product.repository';
import { OrderRepository } from '@domain/order/order.repository';
import { Order } from '@domain/order/order.entity';
import { OrderItem } from '@domain/order/order-item.entity';
import { OrderStatus } from '@domain/order/order-status.enum';
import { ConflictError, NotFoundError, ValidationError } from '@domain/common/errors';
import { IdempotencyStore } from '../ports/idempotency-store';
import { LockManager } from '../ports/lock-manager';
import { AppLogger } from '../ports/logger';
import { TelemetryService } from '../ports/telemetry';
import { TOKENS } from '@shared/tokens';
import { EnqueueErpSyncCommand } from './enqueue-erp-sync.command';
import { CHECKOUT_MESSAGES } from './checkout.messages';
import { inline } from '@shared/i18n/bilingual';

export enum CheckoutResponseStatus {
  SUCCESS = 'SUCCESS',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  DUPLICATE = 'DUPLICATE',
  TECHNICAL_FAILURE = 'TECHNICAL_FAILURE',
}

export interface CreateCheckoutInput {
  customerId: string;
  productId: string;
  quantity: number;
  idempotencyKey: string;
}

export interface CheckoutResponseDto {
  status: CheckoutResponseStatus;
  orderId?: string;
  orderStatus?: OrderStatus;
  message: string;
  duplicate?: boolean;
}

@Injectable()
export class CreateCheckoutCommand {
  private readonly idempotencyTtlSeconds: number;
  private readonly lockTtlMs = 5000;

  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
    @Inject(TOKENS.IDEMPOTENCY_STORE)
    private readonly idempotencyStore: IdempotencyStore,
    @Inject(TOKENS.LOCK_MANAGER)
    private readonly lockManager: LockManager,
    @Inject(TOKENS.LOGGER)
    private readonly logger: AppLogger,
    @Inject(TOKENS.TELEMETRY)
    private readonly telemetry: TelemetryService,
    private readonly enqueueErpSync: EnqueueErpSyncCommand,
    private readonly configService: ConfigService,
  ) {
    this.idempotencyTtlSeconds = Number(
      this.configService.get('idempotency.ttlSeconds', 600),
    );
  }

  async execute(input: CreateCheckoutInput): Promise<CheckoutResponseDto> {
    const endSpan = this.telemetry.startSpan('checkout.execute', {
      customerId: input.customerId,
      productId: input.productId,
    });
    let spanClosed = false;
    const closeSpan = () => {
      if (!spanClosed) {
        endSpan();
        spanClosed = true;
      }
    };
    this.logger.info('Create checkout command received', { customerId: input.customerId });
    this.telemetry.incrementCounter('checkout_total', { labels: { status: 'received' } });
    this.validateInput(input);

    const existingRecord = await this.idempotencyStore.get<CheckoutResponseDto>(input.idempotencyKey);
    if (existingRecord) {
      this.logger.info('Idempotent request detected', { key: input.idempotencyKey });
      this.telemetry.incrementCounter('checkout_total', { labels: { status: 'duplicate' } });
      closeSpan();
      return { ...existingRecord.response, duplicate: true };
    }

    const lockKey = `lock:product:${input.productId}`;
    const acquired = await this.lockManager.acquire(lockKey, this.lockTtlMs);
    if (!acquired) {
      this.logger.warn('Unable to acquire lock for product', { productId: input.productId });
      throw new ConflictError(inline(CHECKOUT_MESSAGES.lockConflict));
    }

    try {
      const product = await this.productRepository.findById(input.productId);
      if (!product || !product.isActive) {
        throw new NotFoundError(inline(CHECKOUT_MESSAGES.productNotFound));
      }

      let reservedProduct;
      try {
        reservedProduct = await this.productRepository.reserveStock(product.id, input.quantity);
      } catch (error) {
        if ((error as Error).message !== 'Insufficient stock') {
          throw error;
        }
        this.logger.warn('Insufficient stock during checkout', {
          productId: product.id,
          quantity: input.quantity,
        });
        const response: CheckoutResponseDto = {
          status: CheckoutResponseStatus.INSUFFICIENT_STOCK,
          message: inline(CHECKOUT_MESSAGES.insufficientStock),
        };
        await this.idempotencyStore.set(input.idempotencyKey, response, this.idempotencyTtlSeconds);
        this.telemetry.incrementCounter('checkout_total', { labels: { status: 'insufficient' } });
        closeSpan();
        return response;
      }

      const orderItem = OrderItem.create({
        productId: reservedProduct.id,
        productName: reservedProduct.name,
        quantity: input.quantity,
        priceCents: reservedProduct.priceCents,
      });

      const order = Order.create({
        customerId: input.customerId,
        idempotencyKey: input.idempotencyKey,
        items: [orderItem],
        status: OrderStatus.PENDING,
        totalCents: orderItem.totalCents,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.orderRepository.save(order);
      order.markProcessing();
      await this.orderRepository.update(order);

      await this.enqueueErpSync.execute({
        orderId: order.id,
        productId: product.id,
        quantity: input.quantity,
        customerId: order.customerId,
        idempotencyKey: input.idempotencyKey,
      });

      const response: CheckoutResponseDto = {
        status: CheckoutResponseStatus.SUCCESS,
        orderId: order.id,
        orderStatus: order.status,
        message: inline(CHECKOUT_MESSAGES.success),
      };
      await this.idempotencyStore.set(input.idempotencyKey, response, this.idempotencyTtlSeconds);
      this.telemetry.incrementCounter('checkout_total', { labels: { status: 'queued' } });
      closeSpan();
      return response;
    } finally {
      await this.lockManager.release(lockKey);
      closeSpan();
    }
  }

  private validateInput(input: CreateCheckoutInput) {
    if (input.quantity <= 0) {
      throw new ValidationError(inline(CHECKOUT_MESSAGES.quantityPositive));
    }
    if (!input.productId) {
      throw new ValidationError(inline(CHECKOUT_MESSAGES.productRequired));
    }
    if (!input.customerId) {
      throw new ValidationError(inline(CHECKOUT_MESSAGES.customerRequired));
    }
    if (!input.idempotencyKey) {
      throw new ValidationError(inline(CHECKOUT_MESSAGES.idempotencyKeyRequired));
    }
  }
}
