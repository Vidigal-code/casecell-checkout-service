import { v4 as uuid } from 'uuid';
import { PrismaProductRepository } from '@infrastructure/product/prisma-product.repository';
import { createInMemoryPrisma } from '../../utils/in-memory-db';

describe('PrismaProductRepository (integration)', () => {
  let repository: PrismaProductRepository;
  let prisma: Awaited<ReturnType<typeof createInMemoryPrisma>>;
  const productId = uuid();

  beforeAll(async () => {
    prisma = await createInMemoryPrisma();
    repository = new PrismaProductRepository(prisma as any);

    await prisma.product.create({
      data: {
        id: productId,
        name: 'Capinha',
        description: 'Proteção premium',
        sku: 'SKU-INTEG',
        priceCents: 1099,
        stock: 5,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve reservar estoque de forma atômica', async () => {
    const product = await repository.reserveStock(productId, 2);
    expect(product.stock).toBe(3);
  });

  it('deve impedir reserva acima do estoque', async () => {
    await expect(repository.reserveStock(productId, 10)).rejects.toThrow('Insufficient stock');
  });

  it('deve devolver estoque ao liberar reserva', async () => {
    const product = await repository.releaseStock(productId, 1);
    expect(product.stock).toBe(4);
  });
});
