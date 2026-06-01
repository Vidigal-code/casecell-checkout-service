"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth/ui/login-form";
import { useAppSelector } from "@/shared/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/model/selectors";
import { getAuthenticatedAccessRedirect } from "@/shared/lib/auth-navigation";

export function LoginScene() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    router.replace(getAuthenticatedAccessRedirect());
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="relative flex min-h-[calc(100vh-var(--header-height))] items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-light/60 px-6 py-16 transition-colors dark:from-[#0f1115] dark:via-[#11151c] dark:to-[#0f1115]">
      <div className="absolute inset-0 -z-10 bg-grid-soft" />
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-primary shadow dark:bg-neutral-900/70 dark:text-brand-primary/90">
            Login Seguro
          </span>
          <h1 className="font-display text-4xl text-neutral-900 dark:text-slate-100 md:text-5xl">
            Bem-vindo de volta à CaseCellShop
          </h1>
          <p className="text-lg text-neutral-600 dark:text-slate-300">
            Acesse sua conta para continuar testando o checkout resiliente,
            gerenciar o carrinho e acompanhar pedidos em tempo real.
          </p>
          <ul className="grid gap-3 text-sm text-neutral-600 dark:text-slate-300">
            <li className="rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60">
              • Senhas fortes garantem segurança sem fricção no login.
            </li>
            <li className="rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60">
              • Sessões persistentes com renovação automática de tokens.
            </li>
            <li className="rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/60">
              • RBAC assegura que apenas administradores gerenciem produtos.
            </li>
          </ul>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
