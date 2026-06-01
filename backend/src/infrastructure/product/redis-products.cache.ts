import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ListProductsInputDto } from '@application/products/dto/list-products-input.dto';
import { PaginatedProductsDto } from '@application/products/dto/product.dto';
import { ProductsCache } from '@application/products/products-cache';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Injectable()
export class RedisProductsCache implements ProductsCache {
  private readonly prefix = 'products:list';
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.ttlSeconds = Number(this.configService.get('productsCache.ttlSeconds', 60));
  }

  async get(params: ListProductsInputDto): Promise<PaginatedProductsDto | null> {
    const key = this.buildKey(params);
    const cached = await this.redis.get(key);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as PaginatedProductsDto;
  }

  async set(params: ListProductsInputDto, data: PaginatedProductsDto): Promise<void> {
    const key = this.buildKey(params);
    await this.redis.set(key, JSON.stringify(data), 'EX', this.ttlSeconds);
  }

  async invalidateAll(): Promise<void> {
    const keys = await this.redis.keys(`${this.prefix}:*`);
    if (keys.length) {
      await this.redis.del(keys);
    }
  }

  private buildKey(params: ListProductsInputDto): string {
    const serialized = JSON.stringify({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search ?? '',
    });
    return `${this.prefix}:${serialized}`;
  }
}
