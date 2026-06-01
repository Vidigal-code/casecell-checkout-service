import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/shared/store';

const selectCartState = (state: RootState) => state.cart;

export const selectCartItems = createSelector(selectCartState, (state) => state.items);

export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0),
);

export const selectCartSubtotal = createSelector(selectCartItems, (items) =>
  items.reduce((acc, item) => acc + item.quantity * item.priceCents, 0),
);
