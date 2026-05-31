export interface ProductDto {
  id: string;
  name: string;
  description: string;
  sku: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
}

export interface PaginatedProductsDto {
  data: ProductDto[];
  total: number;
  page: number;
  pageSize: number;
}
