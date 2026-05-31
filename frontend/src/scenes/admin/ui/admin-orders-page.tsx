"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrders, AdminOrdersResponse } from '@/shared/api/orders';
import { useAppSelector } from '@/shared/store/hooks';
import { selectAuthUser } from '@/features/auth/model/selectors';
import { StatusMessage } from '@/shared/ui/status-message';
import { formatCurrency } from '@/shared/lib/format-currency';
import { Skeleton } from '@/shared/ui/skeleton';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'];

export function AdminOrdersPage() {
  const user = useAppSelector(selectAuthUser);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | undefined>();

  const { data, isPending, isError, refetch } = useQuery<AdminOrdersResponse>({
    queryKey: ['admin-orders', page, status],
    queryFn: () => fetchAdminOrders({ page, pageSize: PAGE_SIZE, status }),
    staleTime: 15_000,
  });

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  }, [data]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <StatusMessage
        tone="warning"
        title="Acesso restrito"
        description="Apenas operadores administradores podem visualizar o painel de pedidos."
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-white">Painel administrativo</h1>
        <p className="text-sm text-white/70">
          Acompanhe pedidos em processamento, identifique falhas e monitore a fila de sincronização com o ERP.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-white md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="status-filter" className="text-xs uppercase tracking-wide text-white/60">
            Status
          </label>
          <select
            id="status-filter"
            value={status ?? ''}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value || undefined);
            }}
            className="rounded-full bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-brand-primary"
        >
          Atualizar agora
        </button>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <StatusMessage tone="error" title="Erro ao carregar pedidos" description="Tente novamente em instantes." />
      ) : null}

      {data && !isPending ? (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
          <table className="min-w-full divide-y divide-white/10 text-sm text-white">
            <thead className="bg-white/10">
              <tr className="text-left">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.data.map((order) => (
                <tr key={order.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-white/70">{order.id}</td>
                  <td className="px-4 py-3 text-white/80">{order.customerId}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.productName}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right font-display text-base text-brand-secondary">
                    {formatCurrency(order.totalCents / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-sm text-white/60">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </section>
  );
}

export default AdminOrdersPage;
