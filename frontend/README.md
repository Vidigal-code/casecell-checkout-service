# CaseCellShop Checkout Web

Frontend Next.js que entrega vitrine performática, checkout resiliente e painel administrativo para a CaseCellShop.

## 📋 Contexto do Desafio / Challenge Context

- **Objetivo | Goal:** materializar o fluxo de checkout descrito no Desafio Técnico CaseCellShop, oferecendo vitrine rápida e UX informativa.
- **Escopo | Scope:** listar produtos, gerenciar sessões seed, validar checkout idempotente e comunicar claramente cada resultado ao usuário.

## 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

### Visão Geral
- Next.js 15 (App Router) com tipagem estrita e `typedRoutes` habilitado.
- Organização Feature-Sliced (entities, features, widgets, scenes) preserva legibilidade conforme o projeto cresce.
- Estado global via Redux Toolkit com persistência, React Query para dados e React Hook Form nos fluxos de login/registro/checkout.
- UI responsiva com suporte total a temas claro e escuro, construída com Tailwind CSS, animações pontuais em Framer Motion e feedbacks claros em todas as jornadas (login, registro, carrinho e checkout).

### Arquitetura Atual
- `src/app`: roteamento App Router, layout global, Providers (Redux Persist, React Query).
- `src/scenes/home`: vitrine com destaques técnicos e CTAs para login/cadastro.
- `src/scenes/auth`: telas dedicadas para login e registro com validação de senha forte.
- `src/scenes/cart`: carrinho persistido com resumo, validação de estoque e checkout resiliente.
- `src/scenes/admin`: dashboard com abas para pedidos e CRUD completo de produtos.
- `src/features`: autenticação (login/register), carrinho, checkout resiliente, UI compartilhada.
- `src/entities/product`: componentes e tipagens de domínio.
- `src/widgets`: header, footer, product grid com skeletons e fallback visual.
- `src/shared`: axios client com refresh token, utils de formato, store Redux, UI primitives.

### Problemas Endereçados (perspectiva Frontend)
| Desafio original | Como a UI responde |
|------------------|--------------------|
| Performance da vitrine | Catálogo consome a API paginada e cacheada com skeletons e React Query, mantendo a experiência fluida mesmo com grande volume de produtos. |
| Consistência de estoque | Carrinho persistido respeita o estoque atual, checkout envia `Idempotency-Key`, bloqueia ações durante o processamento e mostra mensagens claras para estoque insuficiente. |
| Resiliência do checkout | Mensagens específicas orientam retries diante de falhas técnicas, polling de `/orders/:id` mantém o usuário informado e os resultados aparecem no painel administrativo. |

### Objetivo de Evolução
- Interface desacoplada, pronta para integrar novos serviços (CDC, dashboards) sem depender diretamente do ERP ou da vitrine legada.

### Pré-requisitos
- Node.js 20+
- npm 9+
- Backend disponível em `NEXT_PUBLIC_API_BASE_URL`

### Configuração
1. Garanta o `.env` na raiz (`cp ../envexample.txt ../.env` ou `cp ../.env.example ../.env`) antes de rodar o frontend; o mesmo arquivo também é lido pelo backend e replicado para Docker Compose.
2. (Opcional) Crie `.env.local` nesta pasta para sobrepor variáveis `NEXT_PUBLIC_*`.
3. Variáveis principais:
   - `NEXT_PUBLIC_API_BASE_URL`: `/api/v1` (caminho relativo usado pelo browser).
   - `NEXT_PUBLIC_DEFAULT_THEME`: tema inicial (`light` por padrão).
   - `INTERNAL_API_BASE_URL`: `http://localhost:3001` para roteamento interno do Next.
   - `CORS_ALLOWED_ORIGINS` no backend deve incluir o domínio onde o frontend roda (ex.: `http://localhost:3000`) para que as requisições tenham sucesso.
   - Para builds Docker, utilize `DOCKER_NEXT_PUBLIC_API_BASE_URL=/api/v1`, `DOCKER_INTERNAL_API_BASE_URL=http://backend:3001` e `DOCKER_NEXT_PUBLIC_DEFAULT_THEME=light` (já presentes no compose). O arquivo `frontend/.env.docker` replica esses valores para o container.

### Scripts
- `npm run dev`: modo desenvolvimento com HMR.
- `npm run build`: build de produção com checagem de tipos e lint.
- `npm run start`: executa o build stand-alone (`.next/standalone`).
- `npm run lint`: `next lint` + ESLint (`eslint-config-next`).
- `npm run test`: suíte Jest completa.
- `npm run test:unit` / `test:integration` / `test:e2e`: escopos específicos com Testing Library e MSW.

### Estrutura
- `src/app`: layout raiz, providers globais, páginas `/`, `/login`, `/register`, `/cart` e `/admin`.
- `src/scenes`: experiências completas de tela (home, auth, cart, admin dashboard).
- `src/features`: unidades funcionais (auth forms, carrinho, checkout resiliente).
- `src/entities`: componentes centrados no domínio (`ProductCard`).
- `src/widgets`: agrupamentos reutilizáveis (header, footer, product grid).
- `src/shared`: client Axios com interceptors, UI primitives, store Redux, utilitários.

### Qualidade & UX
- Tipagem estrita com `moduleResolution: bundler` e ESLint integrado ao build.
- MSW cobre chamadas HTTP nas suítes de integração/e2e.
- Persistência de sessão (tokens) com refresh automático e validação de senhas fortes no backend.
- Carrinho com fallback visual de imagens, resumo detalhado e integração resiliente ao checkout.
- Checkout bloqueia cliques múltiplos, exibe mensagens dedicadas (sucesso, estoque insuficiente, duplicidade, falha técnica) e atualiza status do pedido em tempo real.
- Painel `/admin` oferece filtros por status, contagem de páginas, detalhamento dos itens e CRUD completo de produtos.

</details>

## 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

### Overview
- Next.js 15 (App Router) with strict typing and `typedRoutes` enabled.
- Feature-Sliced structure (entities, features, widgets, scenes) keeps the UI scalable.
- Redux Toolkit with persistence, React Query for data fetching, React Hook Form across login/register/checkout flows.
- Responsive design with full light/dark theme support, Tailwind CSS styling, focused Framer Motion animations, and clear feedback for every journey (auth, cart, checkout).

### Current Architecture
- `src/app`: App Router layout, global Providers (Redux Persist, React Query).
- `src/scenes/home`: storefront landing with technical highlights and CTAs.
- `src/scenes/auth`: dedicated login and register pages with strong-password validation.
- `src/scenes/cart`: persistent cart with stock validation and resilient checkout integration.
- `src/scenes/admin`: dashboard tabs for orders and full product CRUD.
- `src/features`: authentication (login/register), cart, resilient checkout, shared UI.
- `src/entities/product`: domain components/types.
- `src/widgets`: header, footer, product grid with skeleton and image fallback.
- `src/shared`: axios client (with token refresh), formatting utils, Redux store, UI primitives.

### Addressed Problems (Frontend view)
| Original challenge | UI approach |
|--------------------|-------------|
| Storefront performance | The catalog consumes the paginated + cached API with skeleton loaders and React Query, preserving responsiveness under heavy load. |
| Inventory consistency | The persistent cart honours current stock, checkout submits the `Idempotency-Key`, disables actions while processing, and surfaces immediate feedback for shortages. |
| Checkout resilience | Dedicated messages guide retries during technical failures, `/orders/:id` polling keeps users informed, and admins can review outcomes in real time. |

### Evolution Goal
- A decoupled interface ready to plug in future services (CDC, dashboards) without relying on the legacy storefront or direct ERP calls.

### Requirements
- Node.js 20+
- npm 9+
- Backend reachable through `NEXT_PUBLIC_API_BASE_URL`

### Setup
1. Ensure the root `.env` exists (`cp ../envexample.txt ../.env` or `cp ../.env.example ../.env`) before running the frontend; the backend and Docker Compose reuse the same file.
2. (Optional) Add a local `.env.local` in this folder to override `NEXT_PUBLIC_*` values.
3. Key variables:
    - `NEXT_PUBLIC_API_BASE_URL`: `/api/v1` (host-relative path consumed by the browser).
    - `NEXT_PUBLIC_DEFAULT_THEME`: initial theme (`light` by default).
    - `INTERNAL_API_BASE_URL`: `http://localhost:3001` for Next.js internal routing.
    - Ensure the backend `CORS_ALLOWED_ORIGINS` includes the domain serving this frontend (e.g., `http://localhost:3000`) so requests succeed.
    - For Docker builds, rely on `DOCKER_NEXT_PUBLIC_API_BASE_URL=/api/v1`, `DOCKER_INTERNAL_API_BASE_URL=http://backend:3001`, and `DOCKER_NEXT_PUBLIC_DEFAULT_THEME=light` (already defined in compose). The `frontend/.env.docker` file mirrors these values inside the UI container.
    - For Docker builds, rely on `DOCKER_NEXT_PUBLIC_API_BASE_URL` and `DOCKER_NEXT_PUBLIC_DEFAULT_THEME` (pre-set to `http://backend:3001`).

### Scripts
- `npm run dev`: development mode with HMR.
- `npm run build`: production build plus lint/type checks.
- `npm run start`: serve the stand-alone build (`.next/standalone`).
- `npm run lint`: `next lint` + ESLint (`eslint-config-next`).
- `npm run test`: full Jest suite.
- `npm run test:unit` / `test:integration` / `test:e2e`: scoped runs with Testing Library + MSW.

### Architecture
- `src/app`: root layout, global providers, routes `/`, `/login`, `/register`, `/cart`, `/admin`.
- `src/scenes`: full page experiences (home, auth, cart, admin dashboard).
- `src/features`: functional slices (auth forms, cart, resilient checkout).
- `src/entities`: domain-centric components (`ProductCard`).
- `src/widgets`: reusable compositions (header, footer, product grid).
- `src.shared`: Axios client with interceptors, UI primitives, Redux store, helpers.

### Quality & UX
- Strict typing, `typedRoutes`, and ESLint integrated into the build pipeline.
- MSW covers HTTP calls in integration/e2e suites.
- Session persistence with automatic token refresh and backend-enforced password strength.
- Cart delivers image fallback, detailed summary, and resilient checkout integration.
- Checkout prevents double submissions and communicates each outcome (success, low stock, duplicate, technical failure) while polling order status.
- `/admin` dashboard provides status filters, pagination insights, detailed item listings, and complete product CRUD.

</details>
