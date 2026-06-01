import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { ProductRepository } from '@domain/product/product.repository';
import { ValidationError } from '@domain/common/errors';
import { inline } from '@shared/i18n/bilingual';
import { toAdminProductDto, ProductAdminDto } from './product.presenter';

@Injectable()
export class GetProductQuery {
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
    return toAdminProductDto(product);
  }
}
