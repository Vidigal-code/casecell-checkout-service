"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrders, AdminOrdersResponse } from '@/shared/api/orders';
import { useAppSelector } from '@/shared/store/hooks';
import { selectAuthUser } from '@/features/auth/model/selectors';
import { StatusMessage } from '@/shared/ui/status-message';
import { formatCurrency } from '@/shared/lib/format-currency';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';

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
    if (!data || data.total === 0) return 1;
    return Math.max(Math.ceil(data.total / PAGE_SIZE), 1);
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
    <section className="space-y-8">
      <header className="rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
        <h2 className="font-display text-2xl text-neutral-900 dark:text-slate-100">Pedidos recentes</h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-slate-300">
          Acompanhe pedidos em processamento, identifique falhas e monitore a fila de sincronização com o ERP.
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label
              htmlFor="status-filter"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-slate-400"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={status ?? ''}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value || undefined);
              }}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            Atualizar agora
          </Button>
        </div>
      </header>

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
        <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white/95 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
          <table className="min-w-full divide-y divide-neutral-200 text-sm text-neutral-600 dark:divide-neutral-700 dark:text-slate-300">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/70 dark:text-slate-300">
              <tr className="text-left">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {data.data.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-slate-400">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-slate-300">{order.customerId}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-slate-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-slate-300">
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.productName}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right font-display text-base text-brand-primary">
                    {formatCurrency(order.totalCents / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data && data.total > 0 ? (
        <div className="flex w-full flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
          <span className="text-sm text-neutral-500 dark:text-slate-300">
            Página {page} de {totalPages}
          </span>
          <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="w-full md:w-auto"
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="w-full md:w-auto"
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminOrdersPage;
