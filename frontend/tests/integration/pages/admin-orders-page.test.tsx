import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AdminOrdersPage } from '@/scenes/admin/ui/admin-orders-page';
import { authReducer } from '@/features/auth/model/auth-slice';

jest.mock('@/shared/api/orders', () => ({
  fetchAdminOrders: jest.fn().mockResolvedValue({
    data: [
      {
        id: 'order-1',
        customerId: 'cust-1',
        status: 'SUCCESS',
        totalCents: 2598,
        items: [
          { id: 'item-1', productId: 'prod-1', productName: 'Capinha', quantity: 2, priceCents: 1299 },
        ],
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  }),
}));

function renderAdmin() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' },
      },
    },
  });
  const queryClient = new QueryClient();

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AdminOrdersPage />
      </QueryClientProvider>
    </Provider>,
  );
}

describe('AdminOrdersPage', () => {
  it('exibe pedidos e permite alterar filtros', async () => {
    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText(/Pedidos recentes/i)).toBeInTheDocument();
      expect(screen.getByText(/order-1/i)).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/status/i);
    fireEvent.change(select, { target: { value: 'SUCCESS' } });
    expect(select).toHaveValue('SUCCESS');
  });
});
