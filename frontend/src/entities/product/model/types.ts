export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}
