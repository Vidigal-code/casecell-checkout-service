import { PrismaClient } from '@prisma/client';

export async function createInMemoryPrisma(): Promise<PrismaClient> {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL must be provided to run tests.');
  }

  const prisma = new PrismaClient({ datasources: { db: { url } } });
  await prisma.$connect();

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        rec RECORD;
      BEGIN
        FOR rec IN
          SELECT sequence_name
          FROM information_schema.sequences
          WHERE sequence_schema = current_schema()
        LOOP
          EXECUTE format('ALTER SEQUENCE %s RESTART WITH 1', rec.sequence_name);
        END LOOP;
      END;
      $$;
    `);
  } catch (error) {
    if (!process.env.JEST_WORKER_ID) {
      console.warn('Warning: unable to reset database sequences.', error);
    }
  }

  return prisma;
}
