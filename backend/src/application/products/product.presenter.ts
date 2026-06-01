import { Product } from '@domain/product/product.entity';
import { ProductDto } from './dto/product.dto';

export interface ProductAdminDto extends ProductDto {
  isActive: boolean;
}

export const toProductDto = (product: Product): ProductDto => ({
  id: product.id,
  name: product.name,
  description: product.description,
  sku: product.sku,
  priceCents: product.priceCents,
  stock: product.stock,
  imageUrl: product.imageUrl,
});

export const toAdminProductDto = (product: Product): ProductAdminDto => ({
  ...toProductDto(product),
  isActive: product.isActive,
});
