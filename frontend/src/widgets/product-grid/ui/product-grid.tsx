"use client";

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '@/shared/api/products';
import { PaginatedProducts, Product } from '@/entities/product/model/types';
import { ProductCard } from '@/entities/product/ui/product-card';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrency } from '@/shared/lib/format-currency';

interface ProductGridProps {
  onSelect(product: Product): void;
  selectedProductId?: string;
}

const PAGE_SIZE = 4;

export function ProductGrid({ onSelect, selectedProductId }: ProductGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isPending, isError } = useQuery<PaginatedProducts>({
    queryKey: ['products', page, search],
    queryFn: () => fetchProducts({ page, pageSize: PAGE_SIZE, search }),
    staleTime: 30_000,
  });

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.ceil(data.total / PAGE_SIZE) || 1;
  }, [data]);

  return (
    <section id="products" className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl text-white">Escolha sua proteção favorita</h2>
          <p className="text-sm text-white/60">
            Estoque garantido localmente: sem surpresas na hora de finalizar o checkout.
          </p>
        </div>
        <label className="relative flex max-w-sm items-center">
          <Search className="absolute left-4 h-4 w-4 text-white/40" />
          <input
            type="search"
            placeholder="Buscar por smartphone, SKU ou tipo"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="w-full rounded-full bg-white/10 px-12 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
        <div className="rounded-3xl border border-red-400/40 bg-red-400/10 p-6 text-red-100">
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
            />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-white/70 md:flex-row">
        <div className="text-center text-sm md:text-left">
          <span className="font-medium text-white">{data?.total ?? 0}</span> opções ativas no catálogo.
          Estoque atualizado próximo do tempo real.
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-white/80">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedProductId && data ? (
        <aside className="rounded-3xl border border-brand-primary/30 bg-brand-primary/10 p-6 text-sm text-white">
          <h3 className="font-display text-base">Resumo rápido</h3>
          {(() => {
            const product = data?.data.find((item) => item.id === selectedProductId);
            if (!product) return null;
            return (
              <ul className="mt-3 space-y-1 text-white/80">
                <li>Produto: {product.name}</li>
                <li>Preço unitário: {formatCurrency(product.priceCents / 100)}</li>
                <li>Estoque disponível: {product.stock}</li>
              </ul>
            );
          })()}
        </aside>
      ) : null}
    </section>
  );
}
