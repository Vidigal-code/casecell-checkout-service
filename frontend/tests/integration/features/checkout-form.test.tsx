import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckoutForm } from '@/features/checkout/ui/checkout-form';
import { authReducer, type AuthState } from '@/features/auth/model/auth-slice';

jest.mock('@/shared/api/checkout', () => ({
  submitCheckout: jest.fn().mockResolvedValue({
    status: 'SUCCESS',
    orderId: 'order-1',
    message: 'Ok',
  }),
}));

jest.mock('@/shared/api/orders', () => ({
  fetchOrderStatus: jest.fn().mockResolvedValue({
    id: 'order-1',
    status: 'SUCCESS',
    totalCents: 1299,
  }),
}));

const product = {
  id: 'prod-1',
  name: 'Capinha',
  description: 'Proteção premium',
  sku: 'SKU-1',
  priceCents: 1299,
  stock: 5,
};

type AuthSliceState = {
  auth: AuthState;
};

function renderWithProviders(preloadedState?: Partial<AuthSliceState>) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: preloadedState as AuthSliceState | undefined,
  });
  const queryClient = new QueryClient();

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CheckoutForm product={product} />
      </QueryClientProvider>
    </Provider>,
  );
}

describe('CheckoutForm', () => {
  it('mostra aviso quando usuário não está autenticado', () => {
    renderWithProviders();
    expect(screen.getByText('Faça login para finalizar')).toBeInTheDocument();
  });

  it('permite concluir checkout para usuário autenticado', async () => {
    renderWithProviders({
      auth: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: '1', email: 'customer@test.com', role: 'CUSTOMER' },
      },
    });

    const button = screen.getByRole('button', { name: /confirmar compra/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Pedido #/i)).toBeInTheDocument();
    });
  });
});
