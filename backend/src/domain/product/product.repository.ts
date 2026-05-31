import { Product } from './product.entity';

export interface ProductQueryParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(params: ProductQueryParams): Promise<PaginatedProducts>;
  save(product: Product): Promise<void>;
  reserveStock(productId: string, quantity: number): Promise<Product>;
  releaseStock(productId: string, quantity: number): Promise<Product>;
}
