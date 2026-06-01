export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
