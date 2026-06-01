import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from '@domain/product/product.repository';
import { TOKENS } from '@shared/tokens';
import { toAdminProductDto, ProductAdminDto } from './product.presenter';

export interface ListAdminProductsInput {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PaginatedAdminProductsDto {
  data: ProductAdminDto[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListAdminProductsQuery {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly repository: ProductRepository,
  ) {}

  async execute(input: ListAdminProductsInput): Promise<PaginatedAdminProductsDto> {
    const result = await this.repository.findAll({
      page: input.page,
      pageSize: input.pageSize,
      search: input.search,
      includeInactive: true,
    });

    return {
      data: result.data.map(toAdminProductDto),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
