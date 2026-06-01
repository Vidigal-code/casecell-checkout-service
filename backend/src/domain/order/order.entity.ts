import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';
import { BaseEntity } from '../common/base-entity';
import { ValidationError } from '../common/errors';

export interface OrderProps {
  customerId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCents: number;
  idempotencyKey: string;
  failureReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order extends BaseEntity<OrderProps> {
  get customerId(): string {
    return this.props.customerId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): OrderItem[] {
    return this.props.items;
  }

  get totalCents(): number {
    return this.props.totalCents;
  }

  get idempotencyKey(): string {
    return this.props.idempotencyKey;
  }

  get failureReason(): string | null | undefined {
    return this.props.failureReason;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public static create(props: OrderProps, id?: string): Order {
    if (!props.items.length) {
      throw new ValidationError('Order must contain at least one item.');
    }
    if (props.totalCents <= 0) {
      throw new ValidationError('Order total must be greater than zero.');
    }
    return new Order(props, id);
  }

  public markProcessing(): void {
    this.props.status = OrderStatus.PROCESSING;
  }

  public markSuccess(): void {
    this.props.status = OrderStatus.SUCCESS;
    this.props.failureReason = null;
  }

  public markFailure(reason: string): void {
    this.props.status = OrderStatus.FAILED;
    this.props.failureReason = reason;
  }
}
