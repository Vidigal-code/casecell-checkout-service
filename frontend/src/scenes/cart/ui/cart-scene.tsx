"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { selectCartItems, selectCartSubtotal } from '@/features/cart/model/selectors';
import { clearCart, removeItem, updateQuantity } from '@/features/cart/model/cart-slice';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { formatCurrency } from '@/shared/lib/format-currency';
import { submitCheckout, CheckoutResponse } from '@/shared/api/checkout';
import { StatusMessage } from '@/shared/ui/status-message';
import { selectIsAuthenticated } from '@/features/auth/model/selectors';
import { routes } from '@/shared/config/routes';

interface CheckoutSummary {
  productId: string;
  productName: string;
  response: CheckoutResponse;
}

export function CartScene() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useAppDispatch();
  const [summaries, setSummaries] = useState<CheckoutSummary[]>([]);

  const totalFormatted = useMemo(() => formatCurrency(subtotal / 100), [subtotal]);

  const mutation = useMutation({
    mutationFn: async () => {
      const responses: CheckoutSummary[] = [];
      for (const item of items) {
        const response = await submitCheckout({ productId: item.productId, quantity: item.quantity });
        responses.push({ productId: item.productId, productName: item.name, response });
      }
      return responses;
    },
    onSuccess: (responses) => {
      setSummaries(responses);
      dispatch(clearCart());
    },
  });

  useEffect(() => {
    if (items.length > 0) {
      setSummaries([]);
    }
  }, [items.length]);

  const hasItems = items.length > 0;

  return (
    <section className="relative flex min-h-[calc(100vh-var(--header-height))] items-start justify-center bg-gradient-to-b from-white via-brand-light to-white px-6 py-16 transition-colors dark:from-[#0f1115] dark:via-[#11151c] dark:to-[#0f1115]">
      <div className="absolute inset-0 -z-10 bg-grid-soft" />
      <div className="w-full max-w-6xl space-y-12">
        <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-4xl text-neutral-900 dark:text-slate-100">Seu carrinho inteligente</h1>
          <p className="mt-3 max-w-2xl text-neutral-600 dark:text-slate-300">
            Ajuste quantidades, remova itens e finalize o checkout resiliente. O estoque é reservado de forma atômica, garantindo consistência.
          </p>
        </motion.header>

        {!hasItems ? (
          <div className="rounded-4xl border border-neutral-200 bg-white/90 p-12 text-center shadow-xl transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="mt-6 font-display text-2xl text-neutral-900 dark:text-slate-100">Seu carrinho está vazio</h2>
            <p className="mt-2 text-neutral-500 dark:text-slate-300">Explore a vitrine e adicione capinhas com um clique.</p>
            <Link
              href={routes.home}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-5 py-2 font-semibold text-white shadow-lg shadow-brand-primary/40"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-display text-xl text-neutral-900 dark:text-slate-100">{item.name}</h3>
                      <p className="text-sm text-neutral-500 dark:text-slate-300">SKU {item.sku}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => dispatch(removeItem({ productId: item.productId }))}
                      className="self-start text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" /> Remover
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px_120px]">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-slate-200">
                      Preço unitário:{' '}
                      <strong className="ml-1 text-neutral-800 dark:text-slate-100">{formatCurrency(item.priceCents / 100)}</strong>
                    </div>
                    <Input
                      label="Quantidade"
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) =>
                        dispatch(
                          updateQuantity({
                            productId: item.productId,
                            quantity: Number(event.target.value),
                            stock: item.stock,
                          }),
                        )
                      }
                    />
                    <div className="flex flex-col justify-end">
                      <span className="text-xs uppercase tracking-wide text-neutral-400 dark:text-slate-400">Subtotal</span>
                      <strong className="font-display text-lg text-neutral-900 dark:text-slate-100">
                        {formatCurrency((item.priceCents * item.quantity) / 100)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-5 rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
              <h2 className="font-display text-2xl text-neutral-900 dark:text-slate-100">Resumo</h2>
              <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-slate-300">
                <span>Itens</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-slate-300">
                <span>Total</span>
                <strong className="font-display text-2xl text-brand-primary">{totalFormatted}</strong>
              </div>

              {!isAuthenticated ? (
                <StatusMessage
                  tone="warning"
                  title="Autenticação necessária"
                  description="Faça login para finalizar o checkout com tokens seguros."
                />
              ) : null}

              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={mutation.isPending}
                disabled={!isAuthenticated || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Finalizar compra
              </Button>

              {mutation.isError ? (
                <StatusMessage
                  tone="error"
                  title="Checkout interrompido"
                  description="Verifique o estoque ou tente novamente em instantes."
                />
              ) : null}

              {summaries.length ? (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-neutral-900">Resultados recentes</h3>
                  {summaries.map((summary) => (
                    <StatusMessage
                      key={summary.productId}
                      tone={summary.response.status === 'SUCCESS' ? 'success' : 'warning'}
                      title={`${summary.productName}: ${summary.response.status}`}
                      description={summary.response.message}
                    />
                  ))}
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
