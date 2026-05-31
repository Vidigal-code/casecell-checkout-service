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
          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          {
            'bg-gradient-to-r from-brand-primary to-brand-secondary text-black shadow-lg shadow-brand-primary/40':
              variant === 'primary',
            'border border-white/20 bg-transparent text-white hover:border-brand-primary/60':
              variant === 'secondary',
            'text-white/80 hover:text-white': variant === 'ghost',
          },
          className,
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
