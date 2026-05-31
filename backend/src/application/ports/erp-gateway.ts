export interface ErpGatewayResponse {
  externalOrderId: string;
}

export interface ErpGateway {
  processOrder(payload: {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; priceCents: number }>;
    totalCents: number;
  }): Promise<ErpGatewayResponse>;
}
