import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-shimmer rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}
