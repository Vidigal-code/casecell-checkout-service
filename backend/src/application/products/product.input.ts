import { ValidationError } from '@domain/common/errors';
import { ProductProps } from '@domain/product/product.entity';
import { inline } from '@shared/i18n/bilingual';

export interface ProductWriteInput {
  name: string;
  description: string;
  sku: string;
  priceCents: number;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
}

const ensureNonEmpty = (value: string, field: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new ValidationError(
      inline({
        pt: `${field} é obrigatório.`,
        en: `${field} is required.`,
      }),
    );
  }
  return trimmed;
};

export const buildProductProps = (input: ProductWriteInput): ProductProps => {
  const name = ensureNonEmpty(input.name, 'Nome');
  const description = ensureNonEmpty(input.description, 'Descrição');
  const sku = ensureNonEmpty(input.sku, 'SKU').toUpperCase();

  const priceCents = Number.isFinite(input.priceCents) ? Math.round(input.priceCents) : NaN;
  const stock = Number.isFinite(input.stock) ? Math.round(input.stock) : NaN;

  if (!Number.isSafeInteger(priceCents) || priceCents < 0) {
    throw new ValidationError(
      inline({
        pt: 'Preço deve ser um inteiro em centavos maior ou igual a zero.',
        en: 'Price must be a non-negative integer in cents.',
      }),
    );
  }

  if (!Number.isSafeInteger(stock) || stock < 0) {
    throw new ValidationError(
      inline({
        pt: 'Estoque deve ser um inteiro maior ou igual a zero.',
        en: 'Stock must be a non-negative integer.',
      }),
    );
  }

  const imageUrl = input.imageUrl?.trim()
    ? input.imageUrl.trim()
    : undefined;

  return {
    name,
    description,
    sku,
    priceCents,
    stock,
    isActive: input.isActive ?? true,
    imageUrl,
  };
};
