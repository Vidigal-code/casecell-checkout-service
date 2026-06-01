---
title: "Front-end"
description: "Experiência do usuário, fluxo de compra e estratégias de UX adotadas no Casecell Checkout Service."
---

# Front-end

## Stack

- **Next.js 15** (modo App Router) com TypeScript.
- **Feature-Sliced Design (FSD)** para organizar cenas, widgets, features e entidades.
- **React Query** para cache de requisições e estados de carregamento.
- **Redux Toolkit + redux-persist** para carrinho e preferências.
- **Tailwind CSS** + **Framer Motion** para responsividade e animações sutis.

## Principais telas

1. **Home / Vitrine** (`app/page.tsx` → `HomeExperience`)
   - Listagem paginada com busca instantânea.
   - Skeletons e placeholders durante o carregamento.
   - Fallback visual e remoto para imagens de produtos.
   - Resumo lateral exibindo detalhes do item selecionado.

2. **Carrinho & Checkout** (`features/cart`, `widgets/checkout`)
   - Ajuste de quantidades com validação contra estoque.
   - Resumo financeiro com total em tempo real.
   - Botão de compra protegido contra multi-cliques (loading + disabled).

3. **Status de pedido**
   - Feedback imediato após `POST /checkout` (sucesso/erro/estoque/falha técnica).
   - Ações de retry quando há falha temporária.
   - Link para painel administrativo (`/admin`) para operadores.

4. **Painel administrativo** (`/admin`)
   - Filtros por status e paginação server-side.
   - Badges traduzidas (PT-BR), cores distintas por status.
   - NotFound customizado com CTA dinâmico.

## Estados de UX contemplados

| Situação | Comportamento |
| --- | --- |
| Carregando | Skeletons, botões desabilitados, texto de progresso. |
| Sucesso | Toast / mensagem verde, carrinho limpo, link para acompanhar pedido. |
| Validação | Mensagens claras sobre campos obrigatórios ou formatos inválidos. |
| Estoque insuficiente | Alerta destacado com indicação do estoque atual. |
| Erro técnico | Mensagem amigável + opção de tentar novamente. |
| Tentativa duplicada | Mensagem reutilizada (mesma chave de idempotência). |

## Acessibilidade e responsividade

- Layouts testados em breakpoints mobile, tablet e desktop.
- Uso consistente de aria-labels em formulários e botões icônicos.
- Tipografia com contraste alto para modo claro e escuro.

## Internacionalização

- Conteúdo principal em português brasileiro.
- Mensagens críticas também disponíveis em inglês quando necessário (ex.: docs, README, swagger).

## Testes e verificação

- Testes unitários com Jest + React Testing Library para componentes chave.
- Testes e2e (roteiro manual) focados em vitrine, carrinho e checkout.
- Lint (`npm run lint`) garante padrões de código e acessibilidade básica.
