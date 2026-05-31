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
    return <div className="h-9 w-9 rounded-full border border-white/10" />;
  }

  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      aria-label="Alternar tema"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white shadow-inner shadow-white/10 transition hover:border-white/50"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </motion.button>
  );
}
