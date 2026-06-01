---
title: "Front-end"
description: "User experience, purchase flow, and UX strategies implemented in the Casecell Checkout Service."
---

# Front-end

## Stack

- **Next.js 15** (App Router) with TypeScript.
- **Feature-Sliced Design (FSD)** to organize scenes, widgets, features, and entities.
- **React Query** for request caching and loading states.
- **Redux Toolkit + redux-persist** for cart state and preferences.
- **Tailwind CSS** + **Framer Motion** for responsive layouts and subtle animations.

## Key screens

1. **Home / Storefront** (`app/page.tsx` → `HomeExperience`)
   - Paginated listing with instant search.
   - Skeletons and placeholders while fetching.
   - Remote + visual fallback for product images.
   - Side summary displaying the selected product details.

2. **Cart & Checkout** (`features/cart`, `widgets/checkout`)
   - Quantity adjustments validated against stock.
   - Real-time financial summary.
   - Purchase button guarded against double clicks (loading + disabled states).

3. **Order status feedback**
   - Immediate notification after `POST /checkout` (success/validation/stock/technical failure).
   - Retry actions when a temporary failure occurs.
   - Shortcut to the admin dashboard (`/admin`) for operators.

4. **Admin dashboard** (`/admin`)
   - Filters by status with server-side pagination.
   - Localized (PT-BR) badges with meaningful colors.
   - Custom NotFound page with dynamic CTA.

## UX states covered

| Scenario | Behavior |
| --- | --- |
| Loading | Skeletons, disabled buttons, progress copy. |
| Success | Green toast/message, cart cleared, link to track the order. |
| Validation error | Clear hints about required fields or invalid formats. |
| Low stock | Highlighted alert showing current inventory. |
| Technical failure | Friendly message + retry option. |
| Duplicate attempt | Reuses the previous response (same idempotency key). |

## Accessibility & responsiveness

- Layout tested on mobile, tablet, and desktop breakpoints.
- Consistent aria-labels for forms and icon buttons.
- High contrast typography for both light and dark themes.

## Internationalization

- Main copy is in Brazilian Portuguese.
- Critical docs (README, Swagger) include English versions for reviewers.

## Tests & verification

- Unit tests using Jest + React Testing Library for key components.
- Manual e2e script focusing on storefront, cart, and checkout.
- Linting (`npm run lint`) enforces code standards and basic accessibility.
