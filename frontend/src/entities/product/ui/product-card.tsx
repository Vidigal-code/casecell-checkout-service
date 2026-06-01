import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Product } from '@/entities/product/model/types';
import { formatCurrency } from '@/shared/lib/format-currency';
import { Button } from '@/shared/ui/button';
import { getProductFallbackImage } from '@/entities/product/lib/get-product-fallback-image';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onSelect, isSelected, onAddToCart }: ProductCardProps) {
  const fallbackImage = useMemo(() => getProductFallbackImage(product.name), [product.name]);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(product.imageUrl ?? fallbackImage);
  const [hasTriedFallback, setHasTriedFallback] = useState(!product.imageUrl);
  const initials = product.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  useEffect(() => {
    setCurrentSrc(product.imageUrl ?? fallbackImage);
    setHasTriedFallback(!product.imageUrl);
    setImageError(false);
  }, [product.id, product.imageUrl, fallbackImage]);

  return (
    <article
      className={`group flex flex-col justify-between gap-4 rounded-3xl border border-neutral-200 bg-white/95 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40 ${
        isSelected ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-white dark:ring-offset-neutral-800' : ''
      }`}
    >
      <button type="button" onClick={() => onSelect?.(product)} className="flex flex-col gap-4 text-left">
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary/15 via-brand-secondary/15 to-brand-primary/15">
          {!imageError ? (
            <Image
              fill
              src={currentSrc}
              alt={product.name}
              sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={() => {
                if (!hasTriedFallback) {
                  setHasTriedFallback(true);
                  setCurrentSrc(fallbackImage);
                } else {
                  setImageError(true);
                }
              }}
            />
          ) : (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary/40 via-brand-secondary/30 to-brand-primary/40 text-white">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_55%)] opacity-60"
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center justify-center gap-2">
                <Smartphone className="h-7 w-7 opacity-80" />
                <span className="text-2xl font-semibold tracking-wide">{initials || 'CC'}</span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-neutral-900 dark:text-slate-100">{product.name}</h3>
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary/90">
              {product.stock} em estoque
            </span>
          </div>
          <p className="text-sm text-neutral-600 dark:text-slate-300">{product.description}</p>
          <div className="flex items-center justify-between pt-2">
            <strong className="font-display text-2xl text-brand-primary">
              {formatCurrency(product.priceCents / 100)}
            </strong>
            <span className="text-xs uppercase tracking-wide text-neutral-400 dark:text-slate-400">SKU {product.sku}</span>
          </div>
        </div>
      </button>

      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={() => onAddToCart?.(product)}
      >
        Adicionar ao carrinho
      </Button>
    </article>
  );
}
