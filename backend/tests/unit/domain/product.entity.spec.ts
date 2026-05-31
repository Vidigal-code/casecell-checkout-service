import { Product } from '@domain/product/product.entity';
import { ValidationError } from '@domain/common/errors';

describe('Product entity', () => {
  it('deve criar produto válido', () => {
    const product = Product.create({
      name: 'Capinha',
      description: 'Capinha protetora',
      sku: 'SKU-XYZ',
      priceCents: 1299,
      stock: 5,
      isActive: true,
    });

    expect(product.id).toBeDefined();
    expect(product.stock).toBe(5);
  });

  it('não deve permitir preço negativo', () => {
    expect(() =>
      Product.create({
        name: 'Capinha',
        description: 'Capinha protetora',
        sku: 'SKU-NEG',
        priceCents: -10,
        stock: 5,
        isActive: true,
      }),
    ).toThrow(ValidationError);
  });

  it('não deve permitir reduzir estoque com quantidade inválida', () => {
    const product = Product.create({
      name: 'Capinha',
      description: 'Capinha protetora',
      sku: 'SKU-RED',
      priceCents: 1299,
      stock: 2,
      isActive: true,
    });

    expect(() => product.decreaseStock(3)).toThrow(ValidationError);
  });
});
