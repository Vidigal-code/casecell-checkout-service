import { BaseEntity } from '../common/base-entity';
import { ValidationError } from '../common/errors';

export interface OrderItemProps {
  productId: string;
  productName: string;
  quantity: number;
  priceCents: number;
}

export class OrderItem extends BaseEntity<OrderItemProps> {
  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get priceCents(): number {
    return this.props.priceCents;
  }

  public static create(props: OrderItemProps, id?: string): OrderItem {
    if (props.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero.');
    }
    if (props.priceCents <= 0) {
      throw new ValidationError('Price must be greater than zero.');
    }
    return new OrderItem(props, id);
  }

  get totalCents(): number {
    return this.props.priceCents * this.props.quantity;
  }
}
