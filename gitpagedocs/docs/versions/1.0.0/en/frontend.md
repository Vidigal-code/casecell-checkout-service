---
title: "Front-end"
description: "Experience design, data flow, and admin tooling shipped with the Casecell Checkout Service UI."
---

# Front-end

## Stack

- Next.js 15 (App Router) with TypeScript and edge-ready layouts.
- Feature-Sliced Design (scenes → widgets → features → entities) to keep responsibilities explicit.
- React Query for declarative data fetching, caching, and retry control.
- Redux Toolkit + redux-persist to store the cart, auth session, and preferences across reloads.
- Axios client with automatic JWT attachment and refresh-token rotation handled by interceptors.
- Tailwind CSS themed with bespoke `brand` tokens, Space Grotesk / Work Sans typography, and Framer Motion micro-interactions.

## Architecture highlights

- `src/app` hosts route entries (home, login, register, cart, admin) wired to scene components.
- `scenes/` orchestrate page-level experiences; `features/` encapsulate cart, checkout, auth, and theme behaviours.
- `shared/` centralises API clients, env normalisation, store setup, design-system primitives, and utilities.
- Providers (`app/providers.tsx`) bootstrap the Redux store, persistence gate, React Query client, and theme manager.

## Key screens

1. **Home / Storefront** (`scenes/home/ui/home-experience.tsx`)
   - Hero section emphasises resilience selling points with animated cards.
   - `ProductGrid` offers search, pagination, skeletons, and image fallbacks while resurfacing stock/price info.
   - Selecting a product reveals a sticky summary with quick add-to-cart actions.

2. **Cart & Checkout** (`scenes/cart/ui/cart-scene.tsx`)
   - Cart items persist locally, allow quantity edits bounded by stock, and surface per-item subtotals.
   - Checkout mutation loops through items, calls the backend with idempotency headers, and prints status messages per product.
   - Authentication gating displays warnings and disables the CTA until the user logs in.

3. **Auth flows** (`scenes/auth`)
   - Login and register pages enforce the backend password policy and auto-redirect authenticated users.
   - Forms use shared input components with accessible labels, helper texts, and error messaging.
   - Successful auth stores tokens/expirations in Redux, enabling silent refresh via the Axios interceptor.

4. **Admin dashboard** (`scenes/admin/ui/admin-dashboard.tsx`)
   - RBAC guard redirects non-admins with contextual feedback.
   - Operators toggle between orders and product catalog views backed by server pagination and React Query caches.
   - Product modal supports create/edit flows with live image preview and bulk validation, while deactivate performs soft deletes.

## State & data flow

- React Query shares a single `QueryClient` configured for 30s stale time and one retry, preventing UI thrash during latency spikes.
- Redux slices (`auth`, `cart`) expose typed selectors/hooks; persistence ensures cart contents and sessions survive reloads.
- Axios interceptor refreshes tokens exactly once per 401 burst, queues pending requests, and clears the session on failure.
- Shared `env` helper normalises public/internal API URLs so SSR and CSR use the correct base paths.

## UX states covered

| Scenario | Behavior |
| --- | --- |
| Loading | Skeleton cards, shimmering placeholders, and disabled CTAs while data resolves. |
| Success | Toast-like status messages and cart reset with deep links to admin/order pages. |
| Validation error | Inline helpers on inputs plus summary messages for checkout/auth forms. |
| Low stock | Highlighted alerts and quantity caps per product row. |
| Technical failure | Friendly copy with retry buttons, including ERP outage messaging. |
| Duplicate attempt | Reuses cached checkout responses when the idempotency key repeats. |
| Auth required | Warning banner and disabled checkout until the user signs in. |
| Admin restricted | Guarded admin route returns an access warning for non-admin accounts. |

## Accessibility & responsiveness

- Responsive grids scale from mobile to desktop; admin tables remain scrollable with sticky affordances.
- Inputs/buttons ship with aria labels, focus rings, and high-contrast themes for dark/light modes.
- Animations respect reduced motion by relying on subtle fades/translations instead of parallax.

## Internationalization

- Primary copy targets Brazilian Portuguese to match the challenge brief.
- Bilingual Swagger and documentation ensure reviewers can reference English terminology when needed.

## Testing & quality

- Jest + React Testing Library cover critical scenes/components (home, cart, admin) with MSW-powered API mocks.
- Linting (`npm run lint`) and TypeScript strictness keep the UI consistent with shared domain types from the backend.
- Manual smoke scripts validate end-to-end checkout, idempotency, and admin moderation flows.
