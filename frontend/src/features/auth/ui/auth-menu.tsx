"use client";

import { useCallback } from 'react';
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
      <motion.a
        href="#login"
        onClick={onNavigate}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40 ${compact ? 'w-full justify-center' : ''}`}
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </motion.a>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? 'flex-col w-full' : ''}`}>
      {user?.role === 'ADMIN' ? (
        <motion.a
          href="/admin"
          whileTap={{ scale: 0.97 }}
          className={`flex items-center gap-2 rounded-full border border-brand-secondary/40 px-4 py-2 text-sm text-brand-secondary transition hover:border-brand-secondary/70 ${compact ? 'w-full justify-center' : ''}`}
        >
          Painel
        </motion.a>
      ) : null}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        className={`flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20 ${compact ? 'w-full justify-center' : ''}`}
      >
        <LogOut className="h-4 w-4" />
        {user?.email ?? 'Sair'}
      </motion.button>
    </div>
  );
}
