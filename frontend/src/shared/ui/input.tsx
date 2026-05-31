import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-1">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-white/70">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/40 focus:border-brand-primary focus:outline-none dark:bg-white/5 dark:text-white',
            error ? 'border-red-400 focus:border-red-400' : null,
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-red-300">{error}</span> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
