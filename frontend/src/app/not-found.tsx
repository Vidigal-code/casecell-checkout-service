import Link from "next/link";
import { routes } from "@/shared/config/routes";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-light/60 px-6 py-16 text-center transition-colors dark:from-[#0f1115] dark:via-[#11151c] dark:to-[#0f1115]">
      <div className="max-w-xl space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-primary shadow dark:bg-neutral-900/80 dark:text-brand-primary/90">
          Página não encontrada
        </span>
        <h1 className="font-display text-4xl text-neutral-900 dark:text-slate-100 md:text-5xl">
          O conteúdo que você procura saiu da prateleira
        </h1>
        <p className="text-base text-neutral-600 dark:text-slate-300">
          A URL acessada não está disponível. Retorne ao painel administrativo
          para continuar monitorando pedidos e gerenciando produtos.
        </p>
        <div className="flex justify-center">
          <Link
            href={routes.admin}
            className="rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-brand-primary/90 hover:to-brand-secondary/90"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </section>
  );
}
