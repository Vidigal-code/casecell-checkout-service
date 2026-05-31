import { BilingualText } from '@shared/i18n/bilingual';

type LocaleKey = 'pt' | 'en';

interface SwaggerLocaleConfig {
  route: string;
  jsonRoute: string;
  title: string;
  description: string;
}

interface SwaggerLocaleContent {
  title: BilingualText;
  description: BilingualText;
}

interface SwaggerDocConfig {
  version: string;
  locales: Record<LocaleKey, SwaggerLocaleContent & { route: string; jsonRoute: string }>;
}

interface SwaggerOperationContent {
  summary: BilingualText;
  description: BilingualText;
}

interface SwaggerResponseContent {
  ok: BilingualText;
  conflict?: BilingualText;
  duplicate?: BilingualText;
  validation?: BilingualText;
  unavailable?: BilingualText;
  throttled?: BilingualText;
}

export const SWAGGER_DOCUMENTATION: SwaggerDocConfig = {
  version: '1.0.0',
  locales: {
    pt: {
      route: 'docs/pt',
      jsonRoute: 'docs/pt/json',
      title: {
        pt: 'CaseCellShop Checkout API',
        en: 'CaseCellShop Checkout API',
      },
      description: {
        pt: 'Documentação oficial da API de checkout resiliente, incluindo catálogos, pedidos e simulação de ERP.',
        en: 'Official resilient checkout API documentation covering catalog, orders, and ERP simulation.',
      },
    },
    en: {
      route: 'docs/en',
      jsonRoute: 'docs/en/json',
      title: {
        pt: 'CaseCellShop Checkout API',
        en: 'CaseCellShop Checkout API',
      },
      description: {
        pt: 'Referência bilingue para integração com a API de checkout.',
        en: 'Bilingual reference for integrating with the checkout API.',
      },
    },
  },
};

export const SWAGGER_TAGS: Record<string, BilingualText> = {
  products: { pt: 'Produtos', en: 'Products' },
  checkout: { pt: 'Checkout', en: 'Checkout' },
  orders: { pt: 'Pedidos', en: 'Orders' },
  adminOrders: { pt: 'Pedidos (Admin)', en: 'Orders (Admin)' },
  auth: { pt: 'Autenticação', en: 'Authentication' },
  health: { pt: 'Saúde', en: 'Health' },
  metrics: { pt: 'Métricas', en: 'Metrics' },
};

export const SWAGGER_OPERATIONS: Record<string, Record<string, SwaggerOperationContent>> = {
  products: {
    list: {
      summary: {
        pt: 'Listar produtos com paginação',
        en: 'List products with pagination',
      },
      description: {
        pt: 'Retorna a vitrine de capinhas com paginação, busca textual e limites configuráveis.',
        en: 'Returns the phone case catalog with pagination, textual search, and configurable limits.',
      },
    },
  },
  checkout: {
    create: {
      summary: {
        pt: 'Criar tentativa de checkout com idempotência',
        en: 'Create idempotent checkout attempt',
      },
      description: {
        pt: 'Reserva estoque, registra o pedido e agenda sincronização com o ERP. Requer cabeçalho Idempotency-Key e autenticação de cliente.',
        en: 'Reserves inventory, registers the order, and schedules ERP synchronization. Requires the Idempotency-Key header and customer authentication.',
      },
    },
  },
  orders: {
    getStatus: {
      summary: {
        pt: 'Consultar status do pedido',
        en: 'Fetch order status',
      },
      description: {
        pt: 'Retorna o status e os metadados do pedido criado via checkout, incluindo falhas de sincronização.',
        en: 'Returns the status and metadata for orders created via checkout, including synchronization failures.',
      },
    },
  },
  adminOrders: {
    list: {
      summary: {
        pt: 'Listar pedidos para acompanhamento administrativo',
        en: 'List orders for administrative tracking',
      },
      description: {
        pt: 'Retorna pedidos paginados com filtros por status e cliente para uso interno.',
        en: 'Returns paginated orders with filters by status and customer for internal operators.',
      },
    },
  },
  auth: {
    login: {
      summary: {
        pt: 'Autenticar usuário seed',
        en: 'Authenticate seeded user',
      },
      description: {
        pt: 'Gera tokens de acesso e refresh para usuários cadastrados via seed.',
        en: 'Generates access and refresh tokens for seeded users.',
      },
    },
    refresh: {
      summary: {
        pt: 'Renovar token de acesso',
        en: 'Refresh access token',
      },
      description: {
        pt: 'Emite novo par de tokens a partir de um refresh token válido.',
        en: 'Issues a new token pair from a valid refresh token.',
      },
    },
  },
  health: {
    check: {
      summary: {
        pt: 'Verificar status da API e dependências',
        en: 'Check API and dependency status',
      },
      description: {
        pt: 'Executa verificações básicas em PostgreSQL e Redis, retornando o estado atual.',
        en: 'Performs basic checks against PostgreSQL and Redis, returning the current status.',
      },
    },
  },
  metrics: {
    scrape: {
      summary: {
        pt: 'Expor métricas Prometheus',
        en: 'Expose Prometheus metrics',
      },
      description: {
        pt: 'Entrega métricas no formato Prometheus para scraping externo.',
        en: 'Returns metrics in Prometheus format for external scraping.',
      },
    },
  },
};

export const SWAGGER_RESPONSES: Record<string, Record<string, SwaggerResponseContent>> = {
  products: {
    list: {
      ok: {
        pt: 'Produtos listados com sucesso.',
        en: 'Products listed successfully.',
      },
    },
  },
  checkout: {
    create: {
      ok: {
        pt: 'Pedido registrado e aguardando sincronização.',
        en: 'Order registered and waiting for ERP synchronization.',
      },
      conflict: {
        pt: 'Estoque insuficiente para concluir o pedido.',
        en: 'Insufficient stock to complete the order.',
      },
      duplicate: {
        pt: 'Resultado anterior reutilizado devido à idempotência.',
        en: 'Previous result reused due to idempotency.',
      },
      validation: {
        pt: 'Dados de entrada inválidos ou ausentes.',
        en: 'Invalid or missing input data.',
      },
      unavailable: {
        pt: 'Falha temporária na sincronização com o ERP.',
        en: 'Temporary failure while synchronizing with the ERP.',
      },
      throttled: {
        pt: 'Checkout concorrente em andamento para o mesmo produto.',
        en: 'Concurrent checkout already in progress for this product.',
      },
    },
  },
  orders: {
    getStatus: {
      ok: {
        pt: 'Status do pedido retornado com sucesso.',
        en: 'Order status returned successfully.',
      },
    },
  },
  adminOrders: {
    list: {
      ok: {
        pt: 'Pedidos listados com sucesso.',
        en: 'Orders listed successfully.',
      },
    },
  },
  auth: {
    login: {
      ok: {
        pt: 'Autenticação realizada com sucesso.',
        en: 'Authentication completed successfully.',
      },
    },
    refresh: {
      ok: {
        pt: 'Novo token emitido com sucesso.',
        en: 'New token issued successfully.',
      },
    },
  },
  health: {
    check: {
      ok: {
        pt: 'Status do serviço reportado com sucesso.',
        en: 'Service status reported successfully.',
      },
    },
  },
  metrics: {
    scrape: {
      ok: {
        pt: 'Métricas retornadas com sucesso.',
        en: 'Metrics returned successfully.',
      },
    },
  },
};

export const SWAGGER_HEADERS: Record<string, BilingualText> = {
  idempotencyKey: {
    pt: 'Chave única por tentativa de checkout, usada para garantir idempotência.',
    en: 'Unique key per checkout attempt, used to guarantee idempotency.',
  },
};
