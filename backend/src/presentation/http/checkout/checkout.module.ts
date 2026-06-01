import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CreateCheckoutCommand } from '@application/checkout/create-checkout.command';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { ErpSyncQueueModule } from '@infrastructure/queues/erp-sync.queue.module';
import { EnqueueErpSyncCommand } from '@application/checkout/enqueue-erp-sync.command';

@Module({
  imports: [ProductsModule, AuthModule, ErpSyncQueueModule],
  controllers: [CheckoutController],
  providers: [
    CreateCheckoutCommand,
    EnqueueErpSyncCommand,
  ],
})
export class CheckoutModule {}
