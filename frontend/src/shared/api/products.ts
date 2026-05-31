import { api } from '@/shared/api/client';
import { PaginatedProducts } from '@/entities/product/model/types';

export interface ProductsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function fetchProducts(params: ProductsQueryParams = {}): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params });
  return data;
}
