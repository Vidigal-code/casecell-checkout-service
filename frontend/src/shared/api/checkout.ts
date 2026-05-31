import { api } from '@/shared/api/client';

export interface CheckoutPayload {
  productId: string;
  quantity: number;
}

export interface CheckoutResponse {
  status: string;
  orderId?: string;
  orderStatus?: string;
  message: string;
  duplicate?: boolean;
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const idempotencyKey = crypto.randomUUID();
  const { data } = await api.post<CheckoutResponse>('/checkout', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
  return data;
}
