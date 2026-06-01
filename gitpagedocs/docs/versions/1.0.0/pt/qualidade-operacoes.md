---
title: "Qualidade e operações"
description: "Execução, variáveis de ambiente, testes e observabilidade do Casecell Checkout Service."
---

# Qualidade e operações

## Pré-requisitos

- Node.js 20+
- npm 9+
- Docker e Docker Compose (opcional, porém recomendado)
- Redis e PostgreSQL locais ou via Docker

## Configuração de ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp envexample.txt .env
   ```
2. Ajuste variáveis principais:
   - `DATABASE_URL`, `TEST_DATABASE_URL`
   - `REDIS_HOST`, `REDIS_PORT`
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`
   - `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS`, `ERP_SIMULATION_MAX_DELAY_MS`
   - Segredos JWT e tokens de acesso/refresh

## Execução local

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Serviços disponíveis:

- API REST: <http://localhost:3001/api/v1>
- Swagger PT/EN: <http://localhost:3001/docs>
- Métricas Prometheus: <http://localhost:3001/metrics>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Interface: <http://localhost:3000>

## Execução com Docker

```bash
```

Provisiona Postgres, Redis, backend e frontend com um único comando.

## Testes automatizados

| Contexto | Comando |
| --- | --- |
| Backend (todos) | `npm test` |
| Backend unitário | `npm run test:unit` |
| Backend integração | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend (todos) | `npm test` |
| Frontend unitário | `npm run test:unit` |
| Frontend integração | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Antes de rodar os testes do backend, suba o Postgres de testes (`docker compose up -d postgres`) e garanta que `TEST_DATABASE_URL` aponte para `casecell_test`.

## Observabilidade

- **Logs**: formato JSON com `requestId`, usuário opcional, chave de idempotência e tempo de execução.
- **Métricas**: latência de checkout, taxa de erro por categoria, tamanho das filas BullMQ.
- **Tracing**: spans OpenTelemetry descrevem cada etapa do checkout e do worker ERP.

## Processo de validação manual

1. Abrir vitrine, validar skeletons e fallback de imagem.
2. Adicionar produtos ao carrinho, variar quantidades até o limite do estoque.
3. Executar checkout múltiplas vezes para testar idempotência (mesma chave) e falha temporária.
4. Acompanhar pedido no `/admin` e na API `/orders/:id`.
5. Conferir métricas e logs para garantir rastreabilidade.

## Próximos passos sugeridos

- Automatizar testes end-to-end com Playwright.
- Provisionar pipeline CI com lint, testes e docker build.
- Adicionar monitoramento de filas e dashboards (Grafana/Tempo/Loki).
