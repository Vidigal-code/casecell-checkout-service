import { BaseEntity } from '../common/base-entity';
import { ValidationError } from '../common/errors';

export interface ProductProps {
  name: string;
  description: string;
  sku: string;
  priceCents: number;
  stock: number;
  isActive: boolean;
  imageUrl?: string;
}

export class Product extends BaseEntity<ProductProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get sku(): string {
    return this.props.sku;
  }

  get priceCents(): number {
    return this.props.priceCents;
  }

  get stock(): number {
    return this.props.stock;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  public static create(props: ProductProps, id?: string): Product {
    if (props.priceCents < 0) {
      throw new ValidationError('Price must be greater than or equal to zero.');
    }
    if (props.stock < 0) {
      throw new ValidationError('Stock must be greater than or equal to zero.');
    }
    return new Product(props, id);
  }

  public decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero.');
    }
    if (this.props.stock < quantity) {
      throw new ValidationError('Insufficient stock.');
    }
    this.props.stock -= quantity;
  }

  public increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero.');
    }
    this.props.stock += quantity;
  }
}
