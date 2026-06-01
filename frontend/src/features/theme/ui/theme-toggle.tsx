"use client";

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-16 rounded-full border border-neutral-200 dark:border-neutral-700" />;
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label="Alternar tema"
      className="flex h-9 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-600 shadow-sm transition hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-brand-primary/60"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
    </motion.button>
  );
}
