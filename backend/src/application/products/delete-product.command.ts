import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '@domain/common/errors';
import { Product } from '@domain/product/product.entity';
import { ProductRepository } from '@domain/product/product.repository';
import { inline } from '@shared/i18n/bilingual';
import { TOKENS } from '@shared/tokens';
import { buildProductProps } from './product.input';
import { toAdminProductDto, ProductAdminDto } from './product.presenter';

@Injectable()
export class DeleteProductCommand {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(id: string): Promise<ProductAdminDto> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ValidationError(
        inline({
          pt: 'Produto não encontrado.',
          en: 'Product not found.',
        }),
      );
    }

    const props = buildProductProps({
      name: product.name,
      description: product.description,
      sku: product.sku,
      priceCents: product.priceCents,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: false,
    });

    const disabled = Product.create(props, product.id);
    await this.repository.save(disabled);

    return toAdminProductDto(disabled);
  }
}
