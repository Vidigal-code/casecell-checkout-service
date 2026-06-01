import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { ProductRepository } from '@domain/product/product.repository';
import { ValidationError } from '@domain/common/errors';
import { inline } from '@shared/i18n/bilingual';
import { Product } from '@domain/product/product.entity';
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
