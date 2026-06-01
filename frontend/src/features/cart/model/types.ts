export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  priceCents: number;
  imageUrl?: string;
  stock: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
