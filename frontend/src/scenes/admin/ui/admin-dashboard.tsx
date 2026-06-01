"use client";

import { useState } from 'react';
import { useAppSelector } from '@/shared/store/hooks';
import { selectAuthUser } from '@/features/auth/model/selectors';
import { StatusMessage } from '@/shared/ui/status-message';
import { AdminOrdersPage } from './admin-orders-page';
import { AdminProductsPanel } from './admin-products-panel';

type AdminView = 'orders' | 'products';

export function AdminDashboard() {
  const user = useAppSelector(selectAuthUser);
  const [view, setView] = useState<AdminView>('orders');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="px-6 py-16">
        <StatusMessage
          tone="warning"
          title="Acesso restrito"
          description="Apenas administradores podem acessar o painel. Autentique-se com uma conta ADMIN."
        />
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-neutral-900 dark:text-slate-100">Painel administrativo</h1>
        <p className="text-sm text-neutral-500 dark:text-slate-300">
          Gerencie pedidos e catálogo em uma única interface, mantendo o checkout resiliente sob controle.
        </p>
        <nav className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setView('orders')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === 'orders'
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow'
                : 'border border-neutral-200 text-neutral-600 hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-slate-300'
            }`}
          >
            Pedidos
          </button>
          <button
            type="button"
            onClick={() => setView('products')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              view === 'products'
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow'
                : 'border border-neutral-200 text-neutral-600 hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-slate-300'
            }`}
          >
            Produtos
          </button>
        </nav>
      </header>

      {view === 'orders' ? <AdminOrdersPage /> : <AdminProductsPanel />}
    </section>
  );
}
