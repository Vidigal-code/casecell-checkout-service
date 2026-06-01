"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { routes } from "@/shared/config/routes";
import { getAuthenticatedNavLink } from "@/shared/lib/auth-navigation";
import { useAppSelector } from "@/shared/store/hooks";
import { selectAuthUser } from "@/features/auth/model/selectors";

export default function NotFound() {
  const user = useAppSelector(selectAuthUser);
  const navLink = getAuthenticatedNavLink(user);
  const destination = navLink?.href ?? routes.home;
  const label = navLink?.label ?? "Voltar para a vitrine";

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-50 px-6 py-20 text-center transition-colors dark:bg-neutral-950">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10 dark:from-brand-primary/15 dark:via-transparent dark:to-brand-secondary/15" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-3xl space-y-8 rounded-3xl border border-white/60 bg-white/80 p-12 shadow-xl backdrop-blur dark:border-white/10 dark:bg-neutral-900/70"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg">
          <span className="text-2xl font-display">404</span>
        </div>
        <div className="space-y-4">
          <h1 className="font-display text-4xl text-neutral-900 dark:text-slate-100 md:text-5xl">
            Essa vitrine saiu do ar por aqui
          </h1>
          <p className="text-base text-neutral-600 dark:text-slate-300">
            Não encontramos o conteúdo solicitado. Continue a jornada acompanhando pedidos, gerenciando produtos ou explorando a vitrine.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
          <Link
            href={destination}
            className="flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-primary/90 hover:to-brand-secondary/90"
          >
            {label}
          </Link>
          <Link
            href={routes.home}
            className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition hover:border-brand-primary hover:text-brand-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-200 dark:hover:border-brand-primary/60"
          >
            Ir para a página inicial
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
