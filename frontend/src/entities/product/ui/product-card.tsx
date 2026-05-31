import Image from 'next/image';
import { Product } from '@/entities/product/model/types';
import { formatCurrency } from '@/shared/lib/format-currency';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  isSelected?: boolean;
}

export function ProductCard({ product, onSelect, isSelected }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(product)}
      className={`group flex flex-col gap-4 rounded-3xl border p-5 text-left shadow-lg transition ${
        isSelected
          ? 'border-brand-primary bg-white/90 shadow-brand-primary/40 dark:bg-white/5'
          : 'border-white/10 bg-white/70 hover:border-brand-primary/80 dark:bg-white/5'
      }`}
    >
      <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
        {product.imageUrl ? (
          <Image
            fill
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-brand-dark dark:text-white">{product.name}</h3>
          <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs text-brand-primary">
            {product.stock} em estoque
          </span>
        </div>
        <p className="text-sm text-brand-dark/70 dark:text-white/60">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <strong className="font-display text-xl text-brand-primary">
            {formatCurrency(product.priceCents / 100)}
          </strong>
          <span className="text-xs uppercase tracking-wide text-brand-dark/50 dark:text-white/50">
            SKU {product.sku}
          </span>
        </div>
      </div>
    </button>
  );
}
