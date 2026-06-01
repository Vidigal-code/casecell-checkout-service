"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { fetchProducts } from '@/shared/api/products';
import { PaginatedProducts, Product } from '@/entities/product/model/types';
import { ProductCard } from '@/entities/product/ui/product-card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrency } from '@/shared/lib/format-currency';
import { useAppDispatch } from '@/shared/store/hooks';
import { addItem } from '@/features/cart/model/cart-slice';

interface ProductGridProps {
  onSelect(product: Product): void;
  selectedProductId?: string;
}

const PAGE_SIZE = 4;

export function ProductGrid({ onSelect, selectedProductId }: ProductGridProps) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [previewErrorMap, setPreviewErrorMap] = useState<Record<string, boolean>>({});

  const { data, isPending, isError } = useQuery<PaginatedProducts>({
    queryKey: ['products', page, search],
    queryFn: () => fetchProducts({ page, pageSize: PAGE_SIZE, search }),
    staleTime: 30_000,
  });

  const totalPages = useMemo(() => {
    if (!data || data.total === 0) return 1;
    return Math.max(Math.ceil(data.total / PAGE_SIZE), 1);
  }, [data]);

  return (
    <section id="products" className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl text-neutral-900 dark:text-slate-100">Escolha sua proteção favorita</h2>
          <p className="text-sm text-neutral-500 dark:text-slate-300">
            Estoque garantido localmente: sem surpresas na hora de finalizar o checkout.
          </p>
        </div>
        <label className="relative flex max-w-sm items-center">
          <Search className="absolute left-4 h-4 w-4 text-neutral-300 dark:text-slate-500" />
          <input
            type="search"
            placeholder="Buscar por smartphone, SKU ou tipo"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="w-full rounded-full border border-neutral-200 bg-white px-12 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 shadow focus:outline-none focus:ring-2 focus:ring-brand-primary/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
        </label>
      </div>

      {isPending ? (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          Ocorreu um erro ao carregar os produtos. Tente novamente em instantes.
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-6 md:grid-cols-2">
          {data.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelect}
              isSelected={selectedProductId === product.id}
              onAddToCart={(item) => dispatch(addItem({ product: item }))}
            />
          ))}
        </div>
      ) : null}

      {data && data.total > 0 ? (
        <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-neutral-200 bg-white/95 px-6 py-4 text-neutral-500 shadow md:flex-row md:justify-between dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-slate-300">
          <div className="text-center text-sm md:text-left">
            <span className="font-medium text-neutral-800 dark:text-slate-100">{data.total}</span> opções ativas no catálogo. Estoque atualizado próximo do tempo real.
          </div>
          <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="flex h-10 w-full items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-brand-primary hover:text-brand-primary disabled:opacity-40 dark:border-neutral-700 dark:text-slate-300 md:w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-600 dark:text-slate-300 md:text-left">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="flex h-10 w-full items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-brand-primary hover:text-brand-primary disabled:opacity-40 dark:border-neutral-700 dark:text-slate-300 md:w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {selectedProductId && data ? (
        <aside className="rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6 text-sm text-brand-primary dark:border-brand-primary/40 dark:bg-brand-primary/20">
          <h3 className="font-display text-base text-brand-primary/90 dark:text-brand-primary/80">Resumo rápido</h3>
          {(() => {
            const product = data?.data.find((item) => item.id === selectedProductId);
            if (!product) return null;
            const initials = product.name
              .split(' ')
              .slice(0, 2)
              .map((word) => word.charAt(0).toUpperCase())
              .join('');
            const hasPreview = Boolean(product.imageUrl && !previewErrorMap[product.id]);
            return (
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full overflow-hidden rounded-3xl bg-white/40 shadow-inner shadow-brand-primary/20 sm:h-24 sm:w-32 dark:bg-brand-primary/10 dark:shadow-brand-primary/30">
                  {hasPreview ? (
                    <Image
                      fill
                      src={product.imageUrl as string}
                      alt={`Pré-visualização de ${product.name}`}
                      sizes="(min-width: 1024px) 160px, 50vw"
                      className="object-cover"
                      onError={() =>
                        setPreviewErrorMap((prev) => ({
                          ...prev,
                          [product.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-primary/70 via-brand-secondary/60 to-brand-primary/70 text-white">
                      <Smartphone className="h-6 w-6 opacity-80" />
                      <span className="text-lg font-semibold tracking-wide">{initials || 'CC'}</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-1 text-brand-primary/80 dark:text-brand-primary/70">
                  <li className="text-base font-semibold text-brand-primary/90 dark:text-brand-primary/80">{product.name}</li>
                  <li>Preço unitário: {formatCurrency(product.priceCents / 100)}</li>
                  <li>Estoque disponível: {product.stock}</li>
                  <li className="text-xs uppercase tracking-wide text-brand-primary/60 dark:text-brand-primary/50">SKU {product.sku}</li>
                </ul>
              </div>
            );
          })()}
        </aside>
      ) : null}
    </section>
  );
}
