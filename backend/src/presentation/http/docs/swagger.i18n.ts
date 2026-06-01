import { BilingualText } from '@shared/i18n/bilingual';

type LocaleKey = 'pt' | 'en';

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
        pt: 'Documentação oficial da API de checkout resiliente, incluindo catálogos, pedidos, simulação de ERP, CORS restrito e rate limiting global.',
        en: 'Official resilient checkout API documentation covering catalog, orders, ERP simulation, hardened CORS, and global rate limiting.',
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
        pt: 'Referência bilingue para integração com a API de checkout com CORS controlado, cabeçalhos seguros e rate limiting configurável.',
        en: 'Bilingual reference for integrating with the checkout API featuring controlled CORS, hardened headers, and configurable rate limiting.',
      },
    },
  },
};

export const SWAGGER_TAGS: Record<string, BilingualText> = {
  products: { pt: 'Produtos', en: 'Products' },
  adminProducts: { pt: 'Produtos (Admin)', en: 'Products (Admin)' },
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
  adminProducts: {
    list: {
      summary: {
        pt: 'Listar produtos para administração',
        en: 'List products for administration',
      },
      description: {
        pt: 'Retorna todos os produtos com paginação, inclusive inativos, para gestão interna.',
        en: 'Returns all products with pagination, including inactive ones, for internal management.',
      },
    },
    create: {
      summary: {
        pt: 'Cadastrar novo produto',
        en: 'Create new product',
      },
      description: {
        pt: 'Permite que administradores cadastrem novos produtos com estoque inicial e imagem.',
        en: 'Allows administrators to register new products with initial stock and imagery.',
      },
    },
    get: {
      summary: {
        pt: 'Consultar detalhes do produto',
        en: 'Fetch product details',
      },
      description: {
        pt: 'Retorna todos os dados de um produto, incluindo status de publicação.',
        en: 'Returns full product data including publication status.',
      },
    },
    update: {
      summary: {
        pt: 'Atualizar produto existente',
        en: 'Update existing product',
      },
      description: {
        pt: 'Atualiza informações de preço, estoque, imagem e disponibilidade de um produto.',
        en: 'Updates price, stock, imagery, and availability information for a product.',
      },
    },
    remove: {
      summary: {
        pt: 'Desativar produto',
        en: 'Deactivate product',
      },
      description: {
        pt: 'Desativa o produto mantendo histórico para pedidos anteriores.',
        en: 'Deactivates the product while preserving historical orders.',
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
        pt: 'Reserva estoque, registra o pedido e agenda sincronização com o ERP dentro de uma transação ACID. Em caso de falha, estoque, pedido e idempotência são revertidos automaticamente antes de responder. Requer cabeçalho Idempotency-Key e autenticação de cliente.',
        en: 'Reserves inventory, persists the order, and schedules ERP synchronization inside a single ACID transaction. If anything fails, stock, order data, and idempotency entries roll back automatically before responding. Requires the Idempotency-Key header and customer authentication.',
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
    register: {
      summary: {
        pt: 'Registrar novo usuário cliente',
        en: 'Register new customer user',
      },
      description: {
        pt: 'Cria um usuário cliente ativo com senha forte e retorna o par de tokens autenticados.',
        en: 'Creates an active customer user with a strong password and returns the authenticated token pair.',
      },
    },
    login: {
      summary: {
        pt: 'Autenticar usuário registrado',
        en: 'Authenticate registered user',
      },
      description: {
        pt: 'Gera tokens de acesso e refresh para usuários ativos na plataforma.',
        en: 'Generates access and refresh tokens for active platform users.',
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
    logout: {
      summary: {
        pt: 'Encerrar sessão ativa',
        en: 'Revoke active session',
      },
      description: {
        pt: 'Revoga o refresh token informado e impede novas renovações até novo login.',
        en: 'Revokes the provided refresh token and blocks further renewals until a new login.',
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
  adminProducts: {
    list: {
      ok: {
        pt: 'Produtos listados para administração.',
        en: 'Products listed for administration.',
      },
    },
    create: {
      ok: {
        pt: 'Produto criado com sucesso.',
        en: 'Product created successfully.',
      },
      validation: {
        pt: 'Dados inválidos ou SKU duplicado.',
        en: 'Invalid data or duplicate SKU.',
      },
    },
    get: {
      ok: {
        pt: 'Produto retornado com sucesso.',
        en: 'Product returned successfully.',
      },
    },
    update: {
      ok: {
        pt: 'Produto atualizado com sucesso.',
        en: 'Product updated successfully.',
      },
      validation: {
        pt: 'Dados inválidos ou SKU duplicado.',
        en: 'Invalid data or duplicate SKU.',
      },
    },
    remove: {
      ok: {
        pt: 'Produto desativado com sucesso.',
        en: 'Product deactivated successfully.',
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
        pt: 'Falha temporária na sincronização com o ERP. O estoque e o pedido foram revertidos automaticamente; tente novamente em instantes.',
        en: 'Temporary failure while synchronizing with the ERP. Stock and order changes were rolled back automatically; please retry shortly.',
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
    register: {
      ok: {
        pt: 'Usuário criado e autenticado com sucesso.',
        en: 'User registered and authenticated successfully.',
      },
      validation: {
        pt: 'Dados inválidos ou e-mail já utilizado.',
        en: 'Invalid data or e-mail already in use.',
      },
      throttled: {
        pt: 'Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.',
        en: 'Too many consecutive attempts. Please wait a moment before retrying.',
      },
    },
    login: {
      ok: {
        pt: 'Autenticação realizada com sucesso.',
        en: 'Authentication completed successfully.',
      },
      throttled: {
        pt: 'Muitas tentativas de login em sequência. Aguarde alguns instantes e tente novamente.',
        en: 'Too many login attempts in a short window. Wait a few seconds before trying again.',
      },
    },
    refresh: {
      ok: {
        pt: 'Novo token emitido com sucesso.',
        en: 'New token issued successfully.',
      },
      throttled: {
        pt: 'Limite de renovação atingido temporariamente. Tente novamente em instantes.',
        en: 'Refresh limit reached temporarily. Try again in a moment.',
      },
    },
    logout: {
      ok: {
        pt: 'Sessão encerrada com sucesso.',
        en: 'Session terminated successfully.',
      },
      throttled: {
        pt: 'Muitas operações em sequência para o mesmo usuário. Aguarde e tente novamente.',
        en: 'Too many sequential operations for the same user. Please wait and retry.',
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
  rateLimitLimit: {
    pt: 'Número máximo de requisições permitidas na janela configurada.',
    en: 'Maximum number of requests allowed within the configured window.',
  },
  rateLimitRemaining: {
    pt: 'Quantidade de requisições disponíveis antes de atingir o limite.',
    en: 'Requests left before hitting the limit.',
  },
  rateLimitReset: {
    pt: 'Instante em que a contagem de rate limiting será reiniciada (epoch segundos).',
    en: 'Epoch seconds indicating when the rate limiting window resets.',
  },
  retryAfter: {
    pt: 'Tempo em segundos recomendado para aguardar antes de repetir a requisição após 429.',
    en: 'Suggested number of seconds to wait before retrying after a 429 response.',
  },
};
