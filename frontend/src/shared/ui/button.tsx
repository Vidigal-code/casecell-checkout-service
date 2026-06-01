import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          {
            'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/40 dark:shadow-brand-primary/30':
              variant === 'primary',
            'border border-neutral-300 bg-white text-neutral-700 hover:border-brand-primary/60 hover:text-brand-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-brand-primary/60':
              variant === 'secondary',
            'text-neutral-500 hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary/80': variant === 'ghost',
          },
          className,
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white dark:border-slate-600 dark:border-t-white" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
