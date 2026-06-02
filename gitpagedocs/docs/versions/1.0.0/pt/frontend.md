---
title: "Front-end"
description: "Experiência, fluxo de dados e painel administrativo entregues pelo Casecell Checkout Service."
---

# Front-end

## Stack

- Next.js 15 (App Router) com TypeScript e layouts preparados para SSR/CSR.
- Feature-Sliced Design para manter cenas, widgets, features e entidades desacopladas.
- React Query controlando cache, retries e sincronização de dados com o backend.
- Redux Toolkit + redux-persist para sessão de autenticação, carrinho e preferências.
- Cliente Axios com anexação automática de JWT e rotação de refresh tokens via interceptor.
- Tailwind CSS com tokens `brand`, tipografia Space Grotesk/Work Sans e animações Framer Motion.

## Destaques de arquitetura

- `src/app` mantém as rotas (home, login, register, cart, admin) acopladas a scenes específicas.
- `scenes/` orquestram a experiência de cada página; `features/` encapsulam lógicas de carrinho, checkout, auth e tema.
- `shared/` concentra API client, normalização de ambiente, store, componentes de UI e utilitários.
- `app/providers.tsx` injeta Redux, persistência, React Query e controle de tema de forma centralizada.

## Principais telas

1. **Home / Vitrine** (`scenes/home/ui/home-experience.tsx`)
   - Hero destaca o valor do checkout resiliente com cards animados.
   - `ProductGrid` entrega busca, paginação, skeletons e fallback de imagem com resumo lateral do item.
   - Botões levam diretamente para login ou cadastro, reforçando o fluxo de compra.

2. **Carrinho & Checkout** (`scenes/cart/ui/cart-scene.tsx`)
   - Itens persistem no storage, permitem ajustar quantidades limitadas pelo estoque e exibem subtotais imediatos.
   - Mutação de checkout percorre cada item, envia cabeçalho de idempotência e exibe mensagens por produto.
   - Gatilho exige autenticação; ausência de sessão gera aviso e desativa o CTA.

3. **Fluxos de autenticação** (`scenes/auth/ui`)
   - Login e cadastro aplicam a política de senha do backend e redirecionam sessões já autenticadas.
   - Inputs compartilham componentes com rótulos acessíveis, helper text e mensagens de erro inline.
   - Sucesso grava tokens/expiração no Redux, permitindo refresh silencioso pelo interceptor.

4. **Painel administrativo** (`scenes/admin/ui/admin-dashboard.tsx`)
   - Guardas RBAC bloqueiam acesso de não administradores com mensagem contextual.
   - Alternância entre visão de pedidos e catálogo aproveita paginação servidor + React Query.
   - Modal de produto cobre criação/edição com pré-visualização de imagem e validação em massa; desativar realiza soft delete.

## Estado e fluxo de dados

- Um único `QueryClient` com stale time de 30s e retry 1 evita tempestade de requisições em cenários de latência.
- Slices do Redux (`auth`, `cart`) expõem selectors tipados; persistência garante experiência contínua após reload.
- Interceptor Axios executa refresh uma única vez por rajada 401, enfileirando chamadas até obter novo token ou limpar a sessão.
- Helper `env` padroniza URLs públicas/internas para SSR e CSR.

## Estados de UX contemplados

| Situação | Comportamento |
| --- | --- |
| Carregando | Skeletons, placeholders com shimmer e botões desabilitados. |
| Sucesso | Mensagens positivas, limpeza do carrinho e links rápidos para acompanhar pedidos. |
| Validação | Erros inline nos campos e resumos claros em formulários de checkout/auth. |
| Estoque insuficiente | Alertas destacados e limites rígidos de quantidade. |
| Erro técnico | Mensagem amigável + opção de tentar novamente, incluindo falhas do ERP. |
| Tentativa duplicada | Resposta reaproveitada quando a `Idempotency-Key` se repete. |
| Autenticação obrigatória | Banner de aviso e CTA bloqueado até login. |
| Acesso restrito | Painel administrativo avisa e bloqueia usuários sem papel `ADMIN`. |

## Acessibilidade e responsividade

- Grid responsivo cobre mobile, tablet e desktop; tabelas administrativas ficam roláveis com affordances claras.
- Componentes utilizam aria labels, foco visível e contraste adequado em ambos os temas.
- Animações são sutis (fade/translate) para respeitar preferências de movimento reduzido.

## Internacionalização

- Conteúdo principal permanece em português brasileiro, alinhado ao desafio.
- Swagger, documentação e mensagens críticas possuem equivalentes em inglês para revisores.

## Testes e qualidade

- Jest + React Testing Library cobrem cenas e widgets principais com mocks MSW.
- Lint (`npm run lint`) e TypeScript estrito mantêm alinhamento com tipos compartilhados do backend.
- Roteiro manual garante validação ponta a ponta de checkout, idempotência e moderação no painel.
