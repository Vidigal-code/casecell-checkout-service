import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { GetOrderStatusQuery } from '@application/orders/get-order-status.query';
import { ListOrdersQuery } from '@application/orders/list-orders.query';
import { TOKENS } from '@shared/tokens';
import { PrismaOrderRepository } from '@infrastructure/order/prisma-order.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [
    GetOrderStatusQuery,
    ListOrdersQuery,
    {
      provide: TOKENS.ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
  ],
})
export class OrdersModule {}
