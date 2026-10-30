# Front-end

Checkout de produto com reserva de estoque, pedido, idempotência e sincronização assíncrona com ERP simulado. Há catálogo, autenticação, histórico/status de pedidos e administração. A resposta inicial confirma que o pedido foi aceito para processamento; o resultado do ERP é consultado posteriormente.

## Interface e estado

NestJS 10.3, Prisma 5.11/PostgreSQL, Redis, BullMQ 4, JWT/Passport e Argon2. Domain contém entidades/contratos; application comandos/queries/portas; infrastructure adaptadores Prisma/Redis/filas/ERP; presentation controllers. Frontend declara Next.js ^15.0.0-canary.120 e React ^18.3.1, Redux Persist e TanStack Query 5. Consulte o lockfile para a versão resolvida; o manifest usa uma faixa de pré-release.

Modelo central: User, Product, Order e OrderItem; preços/totais usam centavos. Há revogação de tokens, hash de senha e guards de roles. O cache de idempotência usa a chave recebida, sem comparação de payload nesse comando: gere uma chave nova por intenção de compra e reutilize-a apenas para repetir a mesma intenção. O enqueue ocorre após commit SQL, sem outbox transacional; uma falha entre as etapas exige inspeção. Lock com TTL e chave única não equivalem a garantia de exactly-once fim a fim.

Autenticação → catálogo → seleção de um productId e quantity → POST /api/v1/checkout com Bearer JWT e Idempotency-Key. Apenas CUSTOMER pode criar checkout; customerId vem do token. Chave ausente retorna 400. A quantidade e o produto passam pelo DTO e caso de uso; o preço vem do registro no banco.

## Fontes verificadas

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

## Arquivos relacionados

- [backend/src/main.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/main.ts)
- [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts)
- [backend/src/application/checkout/create-checkout.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/create-checkout.command.ts)
- [backend/src/application/checkout/enqueue-erp-sync.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/enqueue-erp-sync.command.ts)
- [backend/src/infrastructure/queues/erp-sync.processor.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/infrastructure/queues/erp-sync.processor.ts)
- [backend/prisma/schema.prisma](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/prisma/schema.prisma)
- [docker-compose.yml](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/docker-compose.yml)

## Navegação

- [Project guide](?menu=pt&lang=pt&id=8)
- [Source reference](?menu=pt&lang=pt&id=9)
