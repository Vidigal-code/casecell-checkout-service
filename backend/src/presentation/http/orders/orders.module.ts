import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { GetOrderStatusQuery } from '@application/orders/get-order-status.query';
import { ListOrdersQuery } from '@application/orders/list-orders.query';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [
    GetOrderStatusQuery,
    ListOrdersQuery,
  ],
})
export class OrdersModule {}
