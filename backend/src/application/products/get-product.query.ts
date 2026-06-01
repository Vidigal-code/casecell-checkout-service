import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '@domain/common/errors';
import { ProductRepository } from '@domain/product/product.repository';
import { inline } from '@shared/i18n/bilingual';
import { TOKENS } from '@shared/tokens';
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
