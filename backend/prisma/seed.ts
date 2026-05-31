import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@casecell.shop';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  const customerEmail = process.env.CUSTOMER_EMAIL ?? 'customer@casecell.shop';
  const customerPassword = process.env.CUSTOMER_PASSWORD ?? 'customer123';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await argon2.hash(adminPassword),
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: customerEmail },
    update: {},
    create: {
      email: customerEmail,
      passwordHash: await argon2.hash(customerPassword),
      role: Role.CUSTOMER,
    },
  });

  const products = [
    {
      name: 'Capinha Impacto iPhone 15 Pro',
      description: 'Proteção premium com tecnologia antichoque e acabamento fosco.',
      sku: 'CASE-IPH15P-IMPACT',
      priceCents: 14990,
      stock: 25,
      imageUrl: 'https://images.placeholders.dev/?width=400&height=400&text=iPhone+15+Pro',
    },
    {
      name: 'Capinha Silicone Galaxy S24',
      description: 'Silicone macio com interior aveludado que evita riscos.',
      sku: 'CASE-GALS24-SILICONE',
      priceCents: 9990,
      stock: 40,
      imageUrl: 'https://images.placeholders.dev/?width=400&height=400&text=Galaxy+S24',
    },
    {
      name: 'Capinha Transparente Motorola Edge 40',
      description: 'Transparente cristal com proteção UV para não amarelar.',
      sku: 'CASE-MOTEDGE40-CLEAR',
      priceCents: 7990,
      stock: 15,
      imageUrl: 'https://images.placeholders.dev/?width=400&height=400&text=Edge+40',
    },
    {
      name: 'Capinha Antimicrobiana iPhone 13',
      description: 'Neutraliza 99% das bactérias e protege contra quedas de até 1,5m.',
      sku: 'CASE-IPH13-ANTIMICRO',
      priceCents: 8990,
      stock: 12,
      imageUrl: 'https://images.placeholders.dev/?width=400&height=400&text=iPhone+13',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: true,
      },
      create: product,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
