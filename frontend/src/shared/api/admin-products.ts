import { api } from '@/shared/api/client';

export interface AdminProductPayload {
  name: string;
  description: string;
  sku: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface AdminProduct extends AdminProductPayload {
  id: string;
}

export interface PaginatedAdminProducts {
  data: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchAdminProducts(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const { data } = await api.get<PaginatedAdminProducts>('/admin/products', { params });
  return data;
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const { data } = await api.post<AdminProduct>('/admin/products', payload);
  return data;
}

export async function updateAdminProduct(id: string, payload: Partial<AdminProductPayload>) {
  const { data } = await api.patch<AdminProduct>(`/admin/products/${id}`, payload);
  return data;
}

export async function deactivateAdminProduct(id: string) {
  const { data } = await api.delete<AdminProduct>(`/admin/products/${id}`);
  return data;
}
