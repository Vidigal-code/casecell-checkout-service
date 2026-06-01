import type { Route } from 'next';
import { routes } from '@/shared/config/routes';
import type { AuthUser } from '@/features/auth/model/auth-slice';
import { ROLES } from '@/shared/config/roles';

export interface NavLink {
  href: Route;
  label: string;
}

export function getPostAuthRedirect(user: AuthUser): Route {
  return user.role === ROLES.ADMIN ? routes.admin : routes.home;
}

export function getAuthenticatedAccessRedirect(): Route {
  return routes.home;
}

export function getAuthenticatedNavLink(user: AuthUser | null): NavLink | null {
  if (!user) {
    return null;
  }

  if (user.role === ROLES.ADMIN) {
    return { href: routes.admin, label: 'Painel' };
  }

  return null;
}
