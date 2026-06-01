import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { ProductRepository } from '@domain/product/product.repository';
import { ValidationError } from '@domain/common/errors';
import { inline } from '@shared/i18n/bilingual';
import { buildProductProps, ProductWriteInput } from './product.input';
import { Product } from '@domain/product/product.entity';
import { toAdminProductDto, ProductAdminDto } from './product.presenter';

export interface UpdateProductInput extends Partial<ProductWriteInput> {
  id: string;
}

@Injectable()
export class UpdateProductCommand {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(input: UpdateProductInput): Promise<ProductAdminDto> {
    const product = await this.repository.findById(input.id);
    if (!product) {
      throw new ValidationError(
        inline({
          pt: 'Produto não encontrado.',
          en: 'Product not found.',
        }),
      );
    }

    const props = buildProductProps({
      name: input.name ?? product.name,
      description: input.description ?? product.description,
      sku: input.sku ?? product.sku,
      priceCents: input.priceCents ?? product.priceCents,
      stock: input.stock ?? product.stock,
      imageUrl: input.imageUrl ?? product.imageUrl,
      isActive: input.isActive ?? product.isActive,
    });

    const otherWithSku = await this.repository.findBySku(props.sku);
    if (otherWithSku && otherWithSku.id !== product.id) {
      throw new ValidationError(
        inline({
          pt: 'SKU já utilizado por outro produto.',
          en: 'SKU already used by another product.',
        }),
      );
    }

    const updated = Product.create(props, product.id);
    await this.repository.save(updated);

    return toAdminProductDto(updated);
  }
}
