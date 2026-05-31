import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '@domain/order/order.repository';
import { OrderStatus } from '@domain/order/order-status.enum';
import { TOKENS } from '@shared/tokens';

export interface ListOrdersInput {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  customerId?: string;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceCents: number;
}

export interface OrderDto {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalCents: number;
  failureReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  items: OrderItemDto[];
}

export interface PaginatedOrdersDto {
  data: OrderDto[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListOrdersQuery {
  constructor(
    @Inject(TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: ListOrdersInput): Promise<PaginatedOrdersDto> {
    const result = await this.orderRepository.findMany(input);

    return {
      data: result.data.map((order) => ({
        id: order.id,
        customerId: order.customerId,
        status: order.status,
        totalCents: order.totalCents,
        failureReason: order.failureReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
