"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { useAppSelector } from "@/shared/store/hooks";
import {
  selectAuthUser,
  selectIsAuthenticated,
} from "@/features/auth/model/selectors";
import { routes } from "@/shared/config/routes";

export function RegisterScene() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const destination = user?.role === "ADMIN" ? routes.admin : routes.home;
    router.replace(destination);
  }, [isAuthenticated, router, user]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="relative flex min-h-[calc(100vh-var(--header-height))] items-center justify-center bg-gradient-to-br from-white via-brand-light to-white px-6 py-16 transition-colors dark:from-[#0f1115] dark:via-[#11151c] dark:to-[#0f1115]">
      <div className="absolute inset-0 -z-10 bg-grid-soft" />
      <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="order-2 space-y-6 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-primary dark:bg-brand-primary/20">
            Cadastro rápido
          </span>
          <h1 className="font-display text-4xl text-neutral-900 dark:text-slate-100 md:text-5xl">
            Crie sua conta em poucos segundos
          </h1>
          <p className="text-lg text-neutral-600 dark:text-slate-300">
            A CaseCellShop mantém seu cadastro seguro e pronto para testar o
            fluxo completo de checkout sem depender do ERP.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-neutral-700 dark:bg-neutral-900/60">
              <h2 className="font-display text-lg text-neutral-900 dark:text-slate-100">
                Senhas fortes
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-slate-300">
                Validação automática garante padrões de segurança com feedback
                imediato.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-neutral-700 dark:bg-neutral-900/60">
              <h2 className="font-display text-lg text-neutral-900 dark:text-slate-100">
                RBAC completo
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-slate-300">
                Utilize contas admin para gerenciar produtos e clientes para
                finalizar pedidos.
              </p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
