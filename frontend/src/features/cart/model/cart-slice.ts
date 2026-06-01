import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from './types';
import { Product } from '@/entities/product/model/types';

const initialState: CartState = {
  items: [],
};

const upsertItem = (items: CartItem[], product: Product, quantity: number): CartItem[] => {
  const normalizedQuantity = Math.max(1, Math.min(quantity, product.stock));
  const existingIndex = items.findIndex((item) => item.productId === product.id);
  if (existingIndex >= 0) {
    const updated = [...items];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: normalizedQuantity,
      stock: product.stock,
      priceCents: product.priceCents,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
    };
    return updated;
  }
  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      stock: product.stock,
      quantity: normalizedQuantity,
    },
  ];
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ product: Product; quantity?: number }>) => {
      state.items = upsertItem(state.items, action.payload.product, action.payload.quantity ?? 1);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number; stock: number }>) => {
      const normalizedQuantity = Math.max(1, Math.min(action.payload.quantity, action.payload.stock));
      state.items = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: normalizedQuantity, stock: action.payload.stock }
          : item,
      );
    },
    removeItem: (state, action: PayloadAction<{ productId: string }>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload.productId);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
