import { BilingualText } from '@shared/i18n/bilingual';

export const CHECKOUT_MESSAGES = {
  success: {
    pt: 'Pedido registrado e aguardando sincronização com o ERP.',
    en: 'Order registered and awaiting ERP synchronization.',
  },
  insufficientStock: {
    pt: 'Quantidade solicitada indisponível em estoque.',
    en: 'Requested quantity is not available in stock.',
  },
  lockConflict: {
    pt: 'Checkout já está em andamento para este produto.',
    en: 'A checkout is already in progress for this product.',
  },
  productNotFound: {
    pt: 'Produto não encontrado ou inativo.',
    en: 'Product not found or inactive.',
  },
  quantityPositive: {
    pt: 'A quantidade deve ser maior que zero.',
    en: 'Quantity must be greater than zero.',
  },
  productRequired: {
    pt: 'Identificador do produto é obrigatório.',
    en: 'Product identifier is required.',
  },
  customerRequired: {
    pt: 'Identificador do cliente é obrigatório.',
    en: 'Customer identifier is required.',
  },
  idempotencyKeyRequired: {
    pt: 'Cabeçalho Idempotency-Key é obrigatório.',
    en: 'Idempotency-Key header is required.',
  },
  unexpectedError: {
    pt: 'Erro inesperado ao processar o pedido.',
    en: 'Unexpected error while processing the order.',
  },
} satisfies Record<string, BilingualText>;
