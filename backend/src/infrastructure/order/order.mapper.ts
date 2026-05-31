import { Order as PrismaOrder, OrderItem as PrismaOrderItem } from '@prisma/client';
import { Order } from '@domain/order/order.entity';
import { OrderItem } from '@domain/order/order-item.entity';
import { OrderStatus } from '@domain/order/order-status.enum';

export class OrderMapper {
  static toDomain(order: PrismaOrder & { items: PrismaOrderItem[] }): Order {
    return Order.create(
      {
        customerId: order.customerId,
        status: order.status as OrderStatus,
        items: order.items.map((item) =>
          OrderItem.create(
            {
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              priceCents: item.priceCents,
            },
            item.id,
          ),
        ),
        totalCents: order.totalCents,
        idempotencyKey: order.idempotencyKey,
        failureReason: order.failureReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      order.id,
    );
  }
}
