import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ListProductsQuery } from '@application/products/list-products.query';
import { TOKENS } from '@shared/tokens';
import { PrismaProductRepository } from '@infrastructure/product/prisma-product.repository';
import { RedisProductsCache } from '@infrastructure/product/redis-products.cache';

@Module({
  controllers: [ProductsController],
  providers: [
    ListProductsQuery,
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
    {
      provide: TOKENS.PRODUCTS_CACHE,
      useClass: RedisProductsCache,
    },
  ],
  exports: [TOKENS.PRODUCT_REPOSITORY, TOKENS.PRODUCTS_CACHE],
})
export class ProductsModule {}
