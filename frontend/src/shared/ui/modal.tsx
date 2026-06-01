"use client";

import { ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  const titleId = useId();
  const descriptionId = description ? `${titleId}-description` : undefined;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handler);
      document.body.classList.add('overflow-hidden');
    }

    return () => {
      document.removeEventListener('keydown', handler);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/95 p-6 shadow-2xl shadow-black/20 backdrop-blur-3xl dark:border-neutral-800 dark:bg-neutral-900/95 dark:shadow-black/60"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-transparent p-2 text-neutral-500 transition hover:border-neutral-200 hover:text-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary dark:text-slate-300 dark:hover:text-slate-100"
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </button>

            <header className="pr-10">
              <h2 id={titleId} className="font-display text-2xl text-neutral-900 dark:text-slate-100">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-2 text-sm text-neutral-500 dark:text-slate-300">
                  {description}
                </p>
              ) : null}
            </header>

            <div className="mt-6 space-y-6">{children}</div>

            {footer ? <footer className="mt-6 flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">{footer}</footer> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
