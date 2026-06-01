import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConflictError, NotFoundError, ValidationError } from '@domain/common/errors';
import { OrderItem } from '@domain/order/order-item.entity';
import { OrderStatus } from '@domain/order/order-status.enum';
import { Order } from '@domain/order/order.entity';
import { OrderRepository } from '@domain/order/order.repository';
import { ProductRepository } from '@domain/product/product.repository';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { inline } from '@shared/i18n/bilingual';
import { TOKENS } from '@shared/tokens';
import { CHECKOUT_MESSAGES } from './checkout.messages';
import { EnqueueErpSyncCommand } from './enqueue-erp-sync.command';
import { IdempotencyStore } from '../ports/idempotency-store';
import { LockManager } from '../ports/lock-manager';
import { AppLogger } from '../ports/logger';
import { TelemetryService } from '../ports/telemetry';

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
    private readonly prisma: PrismaService,
    private readonly enqueueErpSync: EnqueueErpSyncCommand,
    private readonly configService: ConfigService,
  ) {
    this.idempotencyTtlSeconds = Number(this.configService.get('idempotency.ttlSeconds', 600));
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

    const existingRecord = await this.idempotencyStore.get<CheckoutResponseDto>(
      input.idempotencyKey,
    );
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

    let reservedProductId: string | null = null;
    let order: Order | null = null;
    let orderPersisted = false;

    try {
      const transactionResult = await this.prisma.$transaction(async (tx) => {
        const productRecord = await tx.product.findUnique({
          where: { id: input.productId },
        });

        if (!productRecord || !productRecord.isActive) {
          throw new NotFoundError(inline(CHECKOUT_MESSAGES.productNotFound));
        }

        const decremented = await tx.product.updateMany({
          where: {
            id: productRecord.id,
            stock: { gte: input.quantity },
            isActive: true,
          },
          data: {
            stock: {
              decrement: input.quantity,
            },
          },
        });

        if (!decremented.count) {
          throw new InsufficientStockError();
        }

        const orderItem = OrderItem.create({
          productId: productRecord.id,
          productName: productRecord.name,
          quantity: input.quantity,
          priceCents: productRecord.priceCents,
        });

        const pendingOrder = Order.create({
          customerId: input.customerId,
          idempotencyKey: input.idempotencyKey,
          items: [orderItem],
          status: OrderStatus.PENDING,
          totalCents: orderItem.totalCents,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await tx.order.create({
          data: {
            id: pendingOrder.id,
            customerId: pendingOrder.customerId,
            status: pendingOrder.status,
            totalCents: pendingOrder.totalCents,
            idempotencyKey: pendingOrder.idempotencyKey,
            failureReason: pendingOrder.failureReason ?? null,
            createdAt: pendingOrder.createdAt,
            updatedAt: pendingOrder.updatedAt,
            items: {
              create: pendingOrder.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                priceCents: item.priceCents,
              })),
            },
          },
        });

        return { pendingOrder, productRecord };
      });

      reservedProductId = transactionResult.productRecord.id;
      order = transactionResult.pendingOrder;
      orderPersisted = true;

      order.markProcessing();
      await this.orderRepository.update(order);

      await this.enqueueErpSync.execute({
        orderId: order.id,
        productId: transactionResult.productRecord.id,
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
    } catch (error) {
      if (error instanceof InsufficientStockError) {
        this.logger.warn('Insufficient stock during checkout', {
          productId: input.productId,
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

      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError
      ) {
        throw error;
      }
      this.logger.error('Checkout failed during persistence', {
        idempotencyKey: input.idempotencyKey,
        productId: input.productId,
        error,
      });

      if (reservedProductId) {
        try {
          await this.productRepository.releaseStock(reservedProductId, input.quantity);
        } catch (releaseError) {
          this.logger.error('Failed to rollback reserved stock', {
            productId: reservedProductId,
            error: releaseError,
          });
        }
      }

      if (order && orderPersisted) {
        try {
          order.markFailure(inline(CHECKOUT_MESSAGES.unexpectedError));
          await this.orderRepository.update(order);
        } catch (updateError) {
          this.logger.error('Failed to mark order as failed after persistence error', {
            orderId: order.id,
            error: updateError,
          });
        }
      }

      const failureResponse: CheckoutResponseDto = {
        status: CheckoutResponseStatus.TECHNICAL_FAILURE,
        message: inline(CHECKOUT_MESSAGES.unexpectedError),
      };

      await this.idempotencyStore.set(
        input.idempotencyKey,
        failureResponse,
        this.idempotencyTtlSeconds,
      );
      this.telemetry.incrementCounter('checkout_total', { labels: { status: 'failure' } });
      closeSpan();
      return failureResponse;
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

class InsufficientStockError extends Error {}
