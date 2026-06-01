import { Module } from '@nestjs/common';
import { CreateProductCommand } from '@application/products/create-product.command';
import { DeleteProductCommand } from '@application/products/delete-product.command';
import { GetProductQuery } from '@application/products/get-product.query';
import { ListAdminProductsQuery } from '@application/products/list-admin-products.query';
import { ListProductsQuery } from '@application/products/list-products.query';
import { UpdateProductCommand } from '@application/products/update-product.command';
import { AdminProductsController } from './admin-products.controller';
import { ProductsController } from './products.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController, AdminProductsController],
  providers: [
    ListProductsQuery,
    ListAdminProductsQuery,
    CreateProductCommand,
    UpdateProductCommand,
    DeleteProductCommand,
    GetProductQuery,
  ],
})
export class ProductsModule {}
