import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-shimmer rounded-2xl bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800',
        className,
      )}
    />
  );
}
