import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300"
          >
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:placeholder:text-slate-400',
            error ? 'border-red-400 focus:border-red-400 dark:border-red-500 dark:focus:border-red-400' : null,
            className,
          )}
          {...props}
        />
        {helperText && !error ? <span className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</span> : null}
        {error ? <span className="text-xs text-red-500 dark:text-red-300">{error}</span> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
