import { render, screen, waitFor } from '@testing-library/react';
import { HomeExperience } from '@/scenes/home/ui/home-experience';
import { Providers } from '@/app/providers';

jest.mock('@/shared/api/products', () => ({
  fetchProducts: jest.fn().mockResolvedValue({
    data: [
      {
        id: 'prod-1',
        name: 'Capinha',
        description: 'Proteção premium',
        sku: 'SKU-1',
        priceCents: 1299,
        stock: 5,
        imageUrl: '',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 4,
  }),
}));

jest.mock('@/shared/api/checkout', () => ({
  submitCheckout: jest.fn(),
}));

jest.mock('@/shared/api/orders', () => ({
  fetchOrderStatus: jest.fn(),
}));

jest.setTimeout(30000);

describe('HomeExperience e2e', () => {
  it('renderiza hero, login e vitrine', async () => {
    render(
      <Providers>
        <HomeExperience />
      </Providers>,
    );

    expect(await screen.findByText(/Checkout resiliente/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Capinha/)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Acessar conta/i })).toBeInTheDocument();
  });
});
