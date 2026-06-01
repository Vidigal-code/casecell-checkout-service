"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { AuthMenu } from '@/features/auth/ui/auth-menu';
import { ThemeToggle } from '@/features/theme/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/' as Route, label: 'Vitrine' },
  { href: '/cart' as Route, label: 'Carrinho' },
  { href: '/login' as Route, label: 'Login' },
  { href: '/register' as Route, label: 'Cadastro' },
];

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur transition-colors dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl text-neutral-900 dark:text-slate-100">
          <span className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-2 text-white shadow">
            <ShoppingBag className="h-5 w-5" />
          </span>
          CaseCellShop
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-neutral-500 transition hover:text-brand-primary dark:text-slate-300 dark:hover:text-brand-primary/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <AuthMenu />
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition dark:border-neutral-700 dark:text-slate-200 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="space-y-4 border-t border-neutral-200 bg-white px-6 py-4 shadow transition dark:border-neutral-700 dark:bg-neutral-900/90">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-semibold text-neutral-600 dark:text-slate-300"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center justify-between gap-3">
                <ThemeToggle />
                <AuthMenu compact onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
