"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, RefreshCw, ShoppingCart, LineChart } from 'lucide-react';
import { Product } from '@/entities/product/model/types';
import { ProductGrid } from '@/widgets/product-grid/ui/product-grid';
import { StatusMessage } from '@/shared/ui/status-message';
import { routes } from '@/shared/config/routes';

const heroHighlights = [
  {
    icon: <Zap className="h-5 w-5 text-brand-primary" />,
    title: 'Vitrine performática',
    description: 'Produtos carregam em milissegundos graças ao cache local e paginação eficiente.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-brand-primary" />,
    title: 'Estoque consistente',
    description: 'Reservas atômicas com Redis evitam overselling mesmo sob concorrência alta.',
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-brand-primary" />,
    title: 'ERP desacoplado',
    description: 'Simulação de latência e circuit-breaker protegem o checkout de instabilidades.',
  },
];

const heroShowcaseImage =
  'https://images.placeholders.dev/?width=720&height=480&text=CaseCell%20Checkout&fontSize=56&color=%230C1B33&background=%23F5F2EE';

export function HomeExperience() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [heroImageError, setHeroImageError] = useState(false);
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section
        id="experience"
        className="grid gap-10 rounded-4xl border border-transparent bg-transparent p-0 md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-8 rounded-3xl border border-neutral-200 bg-white/95 p-10 shadow-2xl backdrop-blur-md transition-colors dark:border-slate-800/70 dark:bg-slate-950/85 dark:shadow-black/60">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-primary dark:bg-brand-primary/20">
              <Zap className="h-4 w-4" />
              Checkout resiliente
            </span>
            <h1 className="mt-4 font-display text-4xl text-neutral-900 dark:text-slate-100 md:text-5xl">
              Latência controlada e estoque consistente para milhões de acessos.
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-slate-300">
              Desacoplamos o ERP das jornadas críticas com cache inteligente, locks distribuídos e idempotência. O resultado é uma experiência de compra fluída mesmo em cenários instáveis.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-neutral-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-black/40"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-slate-200">
                  {item.icon}
                  {item.title}
                </div>
                <p className="mt-3 text-sm text-neutral-500 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.login}
              className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/40 transition hover:shadow-brand-primary/60"
            >
              <ShoppingCart className="h-4 w-4" />
              Acessar conta
            </Link>
            <Link
              href={routes.register}
              className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10 dark:border-brand-primary/60 dark:text-brand-primary/90"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <aside className="space-y-5 rounded-3xl border border-neutral-200 bg-gradient-to-br from-brand-light via-white to-white p-8 shadow-xl backdrop-blur-md transition-colors dark:border-slate-800/70 dark:bg-gradient-to-br dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/90 dark:shadow-black/60">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-100/60 bg-white/40 shadow-inner shadow-white/40 dark:border-slate-800/60 dark:bg-slate-900/60 dark:shadow-black/30">
            <div className="relative aspect-[4/3] w-full">
              {!heroImageError ? (
                <Image
                  src={heroShowcaseImage}
                  alt="Painel de pedidos CaseCell evidenciando performance do checkout"
                  fill
                  priority
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover"
                  onError={() => setHeroImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-primary/25 via-brand-secondary/30 to-brand-primary/35 text-brand-primary dark:text-brand-light">
                  <LineChart className="h-10 w-10" />
                  <span className="px-8 text-center text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                    Performance observável
                  </span>
                </div>
              )}
            </div>
          </div>
          <h2 className="font-display text-2xl text-neutral-900 dark:text-slate-100">O que você pode testar</h2>
          <StatusMessage tone="info" title="Resiliência" description="Simulamos latência e falhas do ERP enquanto protegemos a experiência do cliente." />
          <StatusMessage tone="success" title="Consistência" description="Reservas atômicas mantêm estoque sincronizado sem acessar o ERP diretamente." />
          <StatusMessage tone="warning" title="Observabilidade" description="Acompanhe status do pedido, health check e métricas Prometheus integradas." />
        </aside>
      </section>

      <ProductGrid onSelect={setSelectedProduct} selectedProductId={selectedProduct?.id} />

      <section className="mb-16 grid gap-6 rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-xl backdrop-blur-md transition-colors md:grid-cols-3 dark:border-slate-800/70 dark:bg-slate-950/80 dark:shadow-black/60">
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6 text-brand-primary" />}
          title="Idempotência no backend"
          description="Cada tentativa envia uma Idempotency-Key e reaproveita resultados seguros armazenados em Redis." />
        <FeatureCard
          icon={<RefreshCw className="h-6 w-6 text-brand-primary" />}
          title="Retries conscientes"
          description="Falhas técnicas não reduzem estoque; orientações claras incentivam o retry sem atritos." />
        <FeatureCard
          icon={<Zap className="h-6 w-6 text-brand-primary" />}
          title="Observabilidade"
          description="Logs estruturados, health check e métricas expõem cada etapa do checkout." />
      </section>
    </div>
  );
}

export default HomeExperience;

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-800/70 dark:bg-slate-950/70 dark:shadow-black/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary dark:bg-brand-primary/25">
        {icon}
      </div>
      <h3 className="font-display text-lg text-neutral-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-slate-300">{description}</p>
    </div>
  );
}
