import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from '@domain/product/product.repository';
import { TOKENS } from '@shared/tokens';
import { ProductsCache } from './products-cache';
import { PaginatedProductsDto } from './dto/product.dto';
import { ListProductsInputDto } from './dto/list-products-input.dto';
import { toProductDto } from './product.presenter';

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
    const cached = await this.safeCacheGet(input);
    if (cached) {
      return cached;
    }

    const result = await this.repository.findAll({
      page: input.page,
      pageSize: input.pageSize,
      search: input.search,
    });

    const response: PaginatedProductsDto = {
      data: result.data.map(toProductDto),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };

    await this.safeCacheSet(input, response);
    return response;
  }

  private async safeCacheGet(params: ListProductsInput): Promise<PaginatedProductsDto | null> {
    try {
      return await this.cache.get(params);
    } catch (error) {
      // Intentionally swallow cache errors to keep product listing available
      return null;
    }
  }

  private async safeCacheSet(params: ListProductsInput, data: PaginatedProductsDto): Promise<void> {
    try {
      await this.cache.set(params, data);
    } catch (error) {
      // Ignore cache persistence issues so users still receive the fresh data
    }
  }
}
