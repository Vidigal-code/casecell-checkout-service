# Front-end

Product checkout with stock reservation, orders, idempotency and asynchronous synchronization with a simulated ERP. It includes catalog, authentication, order history/status and administration. The initial response confirms acceptance for processing; the ERP outcome is queried later.

## UI and state

NestJS 10.3, Prisma 5.11/PostgreSQL, Redis, BullMQ 4, JWT/Passport and Argon2. Domain holds entities/contracts; application commands/queries/ports; infrastructure Prisma/Redis/queue/ERP adapters; presentation controllers. Frontend declares Next.js ^15.0.0-canary.120, React ^18.3.1, Redux Persist and TanStack Query 5. Check the lockfile for resolved versions; the manifest uses a prerelease range.

Core model: User, Product, Order and OrderItem; prices/totals use cents. Token revocation, password hashing and role guards are implemented. This command's idempotency cache uses the supplied key without payload comparison: generate a new key per purchase intent and reuse it only for the same intent. Enqueue happens after SQL commit without a transactional outbox; failures between stages require inspection. TTL locks/unique keys do not guarantee end-to-end exactly-once execution.

Authentication → catalog → one productId and quantity → POST /api/v1/checkout with Bearer JWT and Idempotency-Key. Only CUSTOMER can checkout; customerId comes from the token. Missing key returns 400. DTO/use case validate quantity/product; price comes from the database.

## Verified sources

- [frontend/src/app/admin/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/admin/page.tsx)
- [frontend/src/app/cart/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/cart/page.tsx)
- [frontend/src/app/login/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/login/page.tsx)
- [frontend/src/app/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/page.tsx)
- [frontend/src/app/register/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/register/page.tsx)
- [frontend/src/features/auth/api/login.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/login.ts)
- [frontend/src/features/auth/api/logout.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/logout.ts)
- [frontend/src/features/auth/api/register.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/register.ts)
- [frontend/src/features/auth/model/auth-slice.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/model/auth-slice.ts)
- [frontend/src/features/cart/model/cart-slice.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/cart/model/cart-slice.ts)
- [frontend/src/scenes/admin/ui/admin-orders-page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/scenes/admin/ui/admin-orders-page.tsx)
- [frontend/src/shared/api/admin-products.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/admin-products.ts)
- [frontend/src/shared/api/checkout.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/checkout.ts)
- [frontend/src/shared/api/client.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/client.ts)
- [frontend/src/shared/api/orders.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/orders.ts)
- [frontend/src/shared/api/products.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/products.ts)
- [frontend/src/shared/config/routes.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/config/routes.ts)
- [frontend/src/shared/store/hooks.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/store/hooks.ts)
- [frontend/src/shared/store/index.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/store/index.ts)

## Related files

- [backend/src/main.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/main.ts)
- [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts)
- [backend/src/application/checkout/create-checkout.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/create-checkout.command.ts)
- [backend/src/application/checkout/enqueue-erp-sync.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/enqueue-erp-sync.command.ts)
- [backend/src/infrastructure/queues/erp-sync.processor.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/infrastructure/queues/erp-sync.processor.ts)
- [backend/prisma/schema.prisma](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/prisma/schema.prisma)
- [docker-compose.yml](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/docker-compose.yml)

## Navigation

- [Project guide](?menu=en&lang=en&id=8)
- [Source reference](?menu=en&lang=en&id=9)
