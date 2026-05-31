import { Inject, Injectable } from '@nestjs/common';
import { OrderRepository } from '@domain/order/order.repository';
import { NotFoundError } from '@domain/common/errors';
import { TOKENS } from '@shared/tokens';

export interface OrderStatusDto {
  id: string;
  status: string;
  failureReason?: string | null;
  totalCents: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class GetOrderStatusQuery {
  constructor(
    @Inject(TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(orderId: string): Promise<OrderStatusDto> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    return {
      id: order.id,
      status: order.status,
      failureReason: order.failureReason,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
