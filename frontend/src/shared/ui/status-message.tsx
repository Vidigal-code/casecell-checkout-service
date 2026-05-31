import { ReactNode } from 'react';
import { clsx } from 'clsx';

type Tone = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
  tone?: Tone;
  title: string;
  description?: ReactNode;
}

const toneStyles: Record<Tone, string> = {
  success: 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100',
  error: 'border-red-400/50 bg-red-400/10 text-red-100',
  warning: 'border-amber-400/50 bg-amber-400/10 text-amber-100',
  info: 'border-sky-400/50 bg-sky-400/10 text-sky-100',
};

export function StatusMessage({ tone = 'info', title, description }: StatusMessageProps) {
  return (
    <div className={clsx('rounded-3xl border px-5 py-4 shadow-inner backdrop-blur', toneStyles[tone])}>
      <h4 className="font-display text-sm">{title}</h4>
      {description ? <p className="mt-1 text-xs opacity-80">{description}</p> : null}
    </div>
  );
}
