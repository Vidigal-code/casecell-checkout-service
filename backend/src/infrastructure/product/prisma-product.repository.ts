import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginatedProducts,
  ProductQueryParams,
  ProductRepository,
} from '@domain/product/product.repository';
import { Product } from '@domain/product/product.entity';
import { ProductMapper } from './product.mapper';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product ? ProductMapper.toDomain(product) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { sku } });
    return product ? ProductMapper.toDomain(product) : null;
  }

  async findAll(params: ProductQueryParams): Promise<PaginatedProducts> {
    const page = Math.max(params.page, 1);
    const pageSize = Math.min(Math.max(params.pageSize, 1), 50);
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
            { sku: { contains: params.search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map(ProductMapper.toDomain),
      total,
      page,
      pageSize,
    };
  }

  async save(product: Product): Promise<void> {
    await this.prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        sku: product.sku,
        priceCents: product.priceCents,
        stock: product.stock,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        priceCents: product.priceCents,
        stock: product.stock,
        isActive: product.isActive,
        imageUrl: product.imageUrl,
      },
    });
  }

  async reserveStock(productId: string, quantity: number): Promise<Product> {
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gte: quantity },
          isActive: true,
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (!updated.count) {
        throw new Error('Insufficient stock');
      }

      const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      return product;
    });

    return ProductMapper.toDomain(result);
  }

  async releaseStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    return ProductMapper.toDomain(product);
  }
}
