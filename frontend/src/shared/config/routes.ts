import type { Route } from 'next';

export const routes = {
  home: '/' as Route,
  login: '/login' as Route,
  register: '/register' as Route,
  cart: '/cart' as Route,
  admin: '/admin' as Route,
} as const;

export type AppRouteKey = keyof typeof routes;
