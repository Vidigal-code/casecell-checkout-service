import { Injectable } from '@nestjs/common';
import { Order } from '@domain/order/order.entity';
import { OrderRepository, OrderQueryParams, PaginatedOrders } from '@domain/order/order.repository';
import { OrderMapper } from './order.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? OrderMapper.toDomain(order) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { idempotencyKey },
      include: { items: true },
    });
    return order ? OrderMapper.toDomain(order) : null;
  }

  async save(order: Order): Promise<void> {
    await this.prisma.order.create({
      data: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        totalCents: order.totalCents,
        idempotencyKey: order.idempotencyKey,
        failureReason: order.failureReason,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceCents: item.priceCents,
          })),
        },
      },
    });
  }

  async update(order: Order): Promise<void> {
    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        totalCents: order.totalCents,
        failureReason: order.failureReason,
      },
    });
  }

  async findMany(params: OrderQueryParams): Promise<PaginatedOrders> {
    const page = Math.max(params.page, 1);
    const pageSize = Math.min(Math.max(params.pageSize, 1), 50);
    const where = {
      status: params.status,
      customerId: params.customerId,
    };

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true, customer: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: rows.map(OrderMapper.toDomain),
      total,
      page,
      pageSize,
    };
  }
}
