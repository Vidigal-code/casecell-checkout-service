import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '@domain/common/errors';
import { Product } from '@domain/product/product.entity';
import { ProductRepository } from '@domain/product/product.repository';
import { inline } from '@shared/i18n/bilingual';
import { TOKENS } from '@shared/tokens';
import { buildProductProps, ProductWriteInput } from './product.input';
import { toAdminProductDto, ProductAdminDto } from './product.presenter';

@Injectable()
export class CreateProductCommand {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(input: ProductWriteInput): Promise<ProductAdminDto> {
    const props = buildProductProps(input);

    const existing = await this.repository.findBySku(props.sku);
    if (existing) {
      throw new ValidationError(
        inline({
          pt: 'SKU já cadastrado.',
          en: 'SKU already registered.',
        }),
      );
    }

    const product = Product.create(props);
    await this.repository.save(product);

    return toAdminProductDto(product);
  }
}
