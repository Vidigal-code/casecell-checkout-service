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
- Organização Feature-Sliced (entities, features, widgets, scenes) para manter legibilidade conforme o projeto cresce.
- Estado global via Redux Toolkit com persistência, fluxo assíncrono com React Query e formulários com React Hook Form.
- UI responsiva com Tailwind CSS, animações pontuais em Framer Motion e feedbacks claros durante o checkout.

### Arquitetura Atual
- `src/app`: roteamento App Router, layout global, Providers (Redux Persist, React Query, Theme).
- `src/scenes/home`: vitrine + checkout integrados com API via React Query.
- `src/scenes/admin`: painel administrativo consumindo `admin/orders`.
- `src/features`: autenticação (login panel, persistência), checkout form, theme toggle.
- `src/entities/product`: componentes e tipagens de domínio.
- `src/widgets`: header, footer, product grid com skeletons.
- `src/shared`: axios client com refresh token, utils de formato, store Redux, UI primitives.

### Problemas Endereçados (perspectiva Frontend)
| Desafio original | Como a UI responde |
|------------------|--------------------|
| Performance da vitrine | Catálogo consome a API paginada e cacheada com skeletons e React Query, mantendo a experiência fluida mesmo com grande volume de produtos. |
| Consistência de estoque | Checkout inclui cabeçalho `Idempotency-Key`, bloqueia cliques durante o processamento e apresenta mensagens claras para estoque insuficiente. |
| Resiliência do checkout | Mensagens específicas orientam retries diante de falhas técnicas e o polling de `/orders/:id` mantém o usuário informado durante a sincronização. |

### Objetivo de Evolução
- Interface desacoplada, pronta para integrar novos serviços (CDC, dashboards) sem depender diretamente do ERP ou da vitrine legada.

### Pré-requisitos
- Node.js 20+
- npm 9+
- Backend disponível em `NEXT_PUBLIC_API_BASE_URL`

### Configuração
1. `cp .env.example .env.local`
2. Variáveis principais:
   - `NEXT_PUBLIC_API_BASE_URL`: origem da API Nest (padrão `http://localhost:3001/api/v1`).
   - `NEXT_PUBLIC_DEFAULT_THEME`: tema inicial (`dark` ou `light`).

### Scripts
- `npm run dev`: modo desenvolvimento com HMR.
- `npm run build`: build de produção com checagem de tipos e lint.
- `npm run start`: executa o build stand-alone (`.next/standalone`).
- `npm run lint`: `next lint` + ESLint (`eslint-config-next`).
- `npm run test`: suíte Jest completa.
- `npm run test:unit` / `test:integration` / `test:e2e`: escopos específicos com Testing Library e MSW.

### Estrutura
- `src/app`: layout raiz, providers globais, páginas `/` e `/admin`.
- `src/scenes`: experiências completas de tela (home, admin).
- `src/features`: unidades funcionais (checkout form, auth panel, theme toggle).
- `src/entities`: componentes centrados no domínio (`ProductCard`).
- `src/widgets`: agrupamentos reutilizáveis (header, footer, product grid).
- `src/shared`: client Axios com interceptors, UI primitives, store Redux, utilitários.

### Qualidade & UX
- Tipagem estrita com `moduleResolution: bundler` e ESLint integrado ao build.
- MSW cobre chamadas HTTP nas suítes de integração/e2e.
- Persistência de sessão (tokens) com refresh automático.
- Checkout bloqueia cliques múltiplos, exibe mensagens dedicadas (sucesso, estoque insuficiente, duplicidade, falha técnica) e atualiza status do pedido em tempo real.
- Painel `/admin` fornece filtros por status, contagem de páginas e detalhamento dos itens.

</details>

## 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

### Overview
- Next.js 15 (App Router) with strict typing and `typedRoutes` enabled.
- Feature-Sliced structure (entities, features, widgets, scenes) keeps the UI scalable.
- Redux Toolkit with persistence, React Query for async flows, React Hook Form for forms.
- Responsive design powered by Tailwind CSS plus focused animations with Framer Motion.

### Current Architecture
- `src/app`: App Router layout, global Providers (Redux Persist, React Query, Theme).
- `src/scenes/home`: storefront + checkout experience powered by React Query.
- `src/scenes/admin`: operator dashboard consuming the `admin/orders` API.
- `src/features`: authentication (login panel, persistence), checkout form, theme toggle.
- `src/entities/product`: domain components/types.
- `src/widgets`: header, footer, product grid with skeleton states.
- `src/shared`: axios client (with token refresh), formatting utils, Redux store, UI primitives.

### Addressed Problems (Frontend view)
| Original challenge | UI approach |
|--------------------|-------------|
| Storefront performance | The catalog consumes the paginated + cached API with skeleton loaders and React Query, preserving responsiveness under heavy load. |
| Inventory consistency | Checkout submits the `Idempotency-Key`, disables actions while processing, and surfaces immediate feedback for stock shortages. |
| Checkout resilience | Dedicated messages guide retries during technical failures, and `/orders/:id` polling keeps users informed while the ERP sync completes. |

### Evolution Goal
- A decoupled interface ready to plug in future services (CDC, dashboards) without relying on the legacy storefront or direct ERP calls.

### Requirements
- Node.js 20+
- npm 9+
- Backend reachable through `NEXT_PUBLIC_API_BASE_URL`

### Setup
1. `cp .env.example .env.local`
2. Key variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Nest API URL (defaults to `http://localhost:3001/api/v1`).
   - `NEXT_PUBLIC_DEFAULT_THEME`: initial theme (`dark` or `light`).

### Scripts
- `npm run dev`: development mode with HMR.
- `npm run build`: production build plus lint/type checks.
- `npm run start`: serve the stand-alone build (`.next/standalone`).
- `npm run lint`: `next lint` + ESLint (`eslint-config-next`).
- `npm run test`: full Jest suite.
- `npm run test:unit` / `test:integration` / `test:e2e`: scoped runs with Testing Library + MSW.

### Architecture
- `src/app`: root layout, global providers, `/` and `/admin` routes.
- `src/scenes`: full page experiences (home, admin dashboard).
- `src/features`: functional slices (checkout form, auth widgets, theme toggle).
- `src/entities`: domain-centric components (`ProductCard`).
- `src/widgets`: reusable compositions (header, footer, product grid).
- `src/shared`: Axios client with interceptors, UI primitives, Redux store, helpers.

### Quality & UX
- Strict typing, `typedRoutes`, and ESLint integrated into the build pipeline.
- MSW covers HTTP calls in integration/e2e suites.
- Session persistence with automatic token refresh.
- Checkout prevents double submissions and communicates each outcome (success, low stock, duplicate, technical failure) while polling order status.
- `/admin` dashboard provides status filters, pagination insights, and detailed item listings.

</details>
