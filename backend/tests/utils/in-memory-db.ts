import { newDb } from 'pg-mem';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export async function createInMemoryPrisma(): Promise<PrismaClient> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.none(`
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');
    CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

    CREATE TABLE "User" (
      "id" UUID PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" "Role" NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE "Product" (
      "id" UUID PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "sku" TEXT UNIQUE NOT NULL,
      "priceCents" INTEGER NOT NULL,
      "stock" INTEGER NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "imageUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE "Order" (
      "id" UUID PRIMARY KEY,
      "customerId" UUID NOT NULL REFERENCES "User"("id"),
      "status" "OrderStatus" NOT NULL,
      "totalCents" INTEGER NOT NULL,
      "failureReason" TEXT,
      "idempotencyKey" TEXT UNIQUE NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE "OrderItem" (
      "id" UUID PRIMARY KEY,
      "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
      "productId" UUID NOT NULL REFERENCES "Product"("id"),
      "productName" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "priceCents" INTEGER NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" ("orderId");
    CREATE INDEX "OrderItem_productId_idx" ON "OrderItem" ("productId");
  `);

  const adapter = new PrismaPg(db.adapters.createPg());
  const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://user:pass@localhost:5432/db' } } });

  return prisma;
}
