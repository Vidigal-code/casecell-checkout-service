import { Module } from '@nestjs/common';
import { CreateCheckoutCommand } from '@application/checkout/create-checkout.command';
import { EnqueueErpSyncCommand } from '@application/checkout/enqueue-erp-sync.command';
import { ErpSyncQueueModule } from '@infrastructure/queues/erp-sync.queue.module';
import { CheckoutController } from './checkout.controller';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule, AuthModule, ErpSyncQueueModule],
  controllers: [CheckoutController],
  providers: [CreateCheckoutCommand, EnqueueErpSyncCommand],
})
export class CheckoutModule {}
