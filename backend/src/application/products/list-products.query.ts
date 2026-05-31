import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from '@domain/product/product.repository';
import { Product } from '@domain/product/product.entity';
import { TOKENS } from '@shared/tokens';
import { ProductsCache } from './products-cache';
import { PaginatedProductsDto, ProductDto } from './dto/product.dto';
import { ListProductsInputDto } from './dto/list-products-input.dto';

export type ListProductsInput = ListProductsInputDto;

@Injectable()
export class ListProductsQuery {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
    @Inject(TOKENS.PRODUCTS_CACHE)
    private readonly cache: ProductsCache,
  ) {}

  async execute(input: ListProductsInput): Promise<PaginatedProductsDto> {
    const cached = await this.cache.get(input);
    if (cached) {
      return cached;
    }

    const result = await this.repository.findAll({
      page: input.page,
      pageSize: input.pageSize,
      search: input.search,
    });

    const response: PaginatedProductsDto = {
      data: result.data.map(this.toProductDto),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };

    await this.cache.set(input, response);
    return response;
  }

  private toProductDto(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      sku: product.sku,
      priceCents: product.priceCents,
      stock: product.stock,
      imageUrl: product.imageUrl,
    };
  }
}
