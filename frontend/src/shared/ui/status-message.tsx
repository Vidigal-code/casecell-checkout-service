import { ReactNode } from 'react';
import { clsx } from 'clsx';

type Tone = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
  tone?: Tone;
  title: string;
  description?: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200',
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200',
  info:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200',
};

export function StatusMessage({ tone = 'info', title, description }: StatusMessageProps) {
  return (
    <div className={clsx('rounded-3xl border px-5 py-4 shadow-inner backdrop-blur transition-colors', toneStyles[tone])}>
      <h4 className="font-display text-sm">{title}</h4>
      {description ? <p className="mt-1 text-xs opacity-80 dark:opacity-90">{description}</p> : null}
    </div>
  );
}
