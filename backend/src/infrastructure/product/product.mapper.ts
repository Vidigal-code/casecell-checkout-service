import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '@domain/product/product.entity';

export class ProductMapper {
  static toDomain(raw: PrismaProduct): Product {
    return Product.create(
      {
        name: raw.name,
        description: raw.description,
        sku: raw.sku,
        priceCents: raw.priceCents,
        stock: raw.stock,
        isActive: raw.isActive,
        imageUrl: raw.imageUrl ?? undefined,
      },
      raw.id,
    );
  }
}
