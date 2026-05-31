import { api } from '@/shared/api/client';

export interface OrderStatusResponse {
  id: string;
  status: string;
  failureReason?: string | null;
  totalCents: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  const { data } = await api.get<OrderStatusResponse>(`/orders/${orderId}`);
  return data;
}

export interface AdminOrdersQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  customerId?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceCents: number;
}

export interface AdminOrder {
  id: string;
  customerId: string;
  status: string;
  totalCents: number;
  failureReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  items: AdminOrderItem[];
}

export interface AdminOrdersResponse {
  data: AdminOrder[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchAdminOrders(params: AdminOrdersQuery = {}): Promise<AdminOrdersResponse> {
  const { data } = await api.get<AdminOrdersResponse>('/admin/orders', { params });
  return data;
}
