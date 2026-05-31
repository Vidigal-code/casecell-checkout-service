import { Order } from './order.entity';
import { OrderStatus } from './order-status.enum';

export interface OrderQueryParams {
  page: number;
  pageSize: number;
  status?: OrderStatus;
  customerId?: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByIdempotencyKey(idempotencyKey: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  findMany(params: OrderQueryParams): Promise<PaginatedOrders>;
}
