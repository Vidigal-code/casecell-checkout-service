import { ListProductsInputDto } from './dto/list-products-input.dto';
import { PaginatedProductsDto } from './dto/product.dto';

export interface ProductsCache {
  get(params: ListProductsInputDto): Promise<PaginatedProductsDto | null>;
  set(params: ListProductsInputDto, data: PaginatedProductsDto): Promise<void>;
  invalidateAll(): Promise<void>;
}
