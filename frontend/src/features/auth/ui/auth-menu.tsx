"use client";

import { useCallback } from 'react';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { clearSession } from '@/features/auth/model/auth-slice';
import { selectAuthUser, selectIsAuthenticated } from '@/features/auth/model/selectors';

interface AuthMenuProps {
  compact?: boolean;
  onNavigate?: () => void;
}

export function AuthMenu({ compact = false, onNavigate }: AuthMenuProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();

  const handleLogout = useCallback(() => {
    dispatch(clearSession());
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <motion.div whileTap={{ scale: 0.97 }}>
        <Link
          href="/login"
          onClick={onNavigate}
          className={`flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:text-slate-300 dark:hover:border-brand-primary/60 dark:hover:text-brand-primary/80 ${compact ? 'w-full justify-center' : ''}`}
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </Link>
      </motion.div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? 'flex-col w-full' : ''}`}>
      {user?.role === 'ADMIN' ? (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Link
            href="/admin"
            className={`flex items-center gap-2 rounded-full border border-brand-secondary/40 px-4 py-2 text-sm font-semibold text-brand-secondary transition hover:border-brand-secondary/70 dark:text-brand-secondary ${compact ? 'w-full justify-center' : ''}`}
            onClick={onNavigate}
          >
            Painel
          </Link>
        </motion.div>
      ) : null}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className={`flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 ${compact ? 'w-full justify-center' : ''}`}
      >
        <LogOut className="h-4 w-4" />
        {user?.email ?? 'Sair'}
      </motion.button>
    </div>
  );
}
