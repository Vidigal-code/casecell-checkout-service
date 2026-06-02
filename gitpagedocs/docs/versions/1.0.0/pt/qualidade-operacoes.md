---
title: "Qualidade e operações"
description: "Setup de ambiente, execução, testes e observabilidade do Casecell Checkout Service."
---

# Qualidade e operações

## Pré-requisitos

- Node.js 20+
- npm 9+
- Docker Desktop para orquestrar banco, cache e serviços com um comando

## Configuração de ambiente

1. Copie o arquivo de exemplo na raiz:
   ```bash
   cp envexample.txt .env
   ```
2. Revise os grupos críticos antes de subir os serviços:
   - `DATABASE_URL`, `TEST_DATABASE_URL`, variáveis `POSTGRES_*`
   - `REDIS_HOST`, `REDIS_PORT`
   - Segredos JWT (`JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`) e tempos de expiração
   - `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS`, `ERP_SIMULATION_MAX_DELAY_MS`
   - `IDEMPOTENCY_TTL_SECONDS`, `PRODUCTS_CACHE_TTL_SECONDS`, limites de rate limiting
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`, `NEXT_PUBLIC_DEFAULT_THEME`

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

Serviços expostos durante o desenvolvimento:

- API REST + auth: <http://localhost:3001/api/v1>
- Swagger bilíngue: <http://localhost:3001/docs>
- Métricas Prometheus: <http://localhost:3001/metrics>
- Health check: <http://localhost:3001/api/v1/health>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Storefront e painel administrativo: <http://localhost:3000>

## Execução com Docker

```bash
docker compose up --build
```

- Provisiona Postgres, Redis, backend e frontend usando o `.env` compartilhado.
- O backend executa `prisma migrate deploy`, `prisma db push` e `prisma db seed` automaticamente antes de iniciar.
- Para rodar os perfis de teste nos containers:
  ```bash
  docker compose --profile test up --build backend-tests frontend-tests
  ```

## Testes automatizados

| Contexto | Comando |
| --- | --- |
| Backend completo | `npm test` |
| Backend unitário | `npm run test:unit` |
| Backend integração | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend completo | `npm test` |
| Frontend unitário | `npm run test:unit` |
| Frontend integração | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Antes de executar os testes do backend localmente, suba o Postgres (`docker compose up -d postgres`) e garanta que `TEST_DATABASE_URL` aponte para `casecell_test`.

## Observabilidade e operações

- **Logs**: Pino em JSON com `requestId`, usuário autenticado, chave de idempotência e duração (log em arquivo controlado por `LOG_FILE_*`).
- **Métricas**: `/api/v1/metrics` traz histograma de latência, taxa de erro, profundidade da fila e estado do circuito.
- **Health**: `/api/v1/health` diferencia `ok` de `degraded`, exibindo status de Postgres e Redis para health checks do Docker.
- **Tracing**: OpenTelemetry instrumenta handlers do checkout e workers da fila, pronto para exportar via OTLP.
- **Swagger**: `/docs` reflete contratos PT/EN; execute `npm run build` após alterar DTOs para manter a documentação sincronizada.

## Checklist de validação manual

1. Abrir a vitrine, conferir animações, skeletons e busca responsiva.
2. Adicionar produtos ao carrinho, testar limites de estoque e persistência após reload.
3. Autenticar com o usuário seed, executar o checkout duas vezes com a mesma `Idempotency-Key` e validar a resposta duplicada.
4. Navegar até `/admin`, filtrar pedidos, desativar/reativar um produto e confirmar atualização no catálogo público.
5. Checar `/api/v1/metrics` e os logs para garantir visibilidade das tentativas do simulador ERP.

## Próximos passos sugeridos

- Automatizar fluxos end-to-end com Playwright ou Cypress.
- Criar pipeline CI (GitHub Actions) rodando lint, testes e build Docker a cada PR.
- Publicar dashboards Grafana usando métricas Prometheus e alarmes para circuito/filas.
