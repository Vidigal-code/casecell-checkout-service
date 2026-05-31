"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { ThemeToggle } from '@/features/theme/ui/theme-toggle';
import { AuthMenu } from '@/features/auth/ui/auth-menu';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '#experience', label: 'Experiência' },
  { href: '#products', label: 'Produtos' },
  { href: '#checkout', label: 'Checkout' },
];

export function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-gradient-to-r from-brand-dark/95 via-brand-dark/90 to-black/80 backdrop-blur">
      <div className="mx-auto flex h-[var(--header-height)] w-full max-w-6xl items-center justify-between px-6">
        <Link href="#" className="flex items-center gap-2 font-display text-xl text-white">
          <span className="rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-2 text-black">
            <ShoppingBag className="h-5 w-5" />
          </span>
          CaseCellShop
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <AuthMenu />
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white md:hidden"
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
            <div className="space-y-4 border-t border-white/5 bg-brand-dark/95 px-6 py-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm font-medium text-white/80"
                >
                  {item.label}
                </a>
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
