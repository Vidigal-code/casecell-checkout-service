"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/entities/product/model/types';
import { ProductGrid } from '@/widgets/product-grid/ui/product-grid';
import { CheckoutForm } from '@/features/checkout/ui/checkout-form';
import { LoginPanel } from '@/features/auth/ui/login-panel';
import { StatusMessage } from '@/shared/ui/status-message';
import { ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export function HomeExperience() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <section
        id="experience"
        className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-white shadow-2xl md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white/70">
              <Zap className="h-4 w-4 text-brand-secondary" />
              Checkout resiliente
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">
              Latência controlada, estoque consistente e duplicidade zero.
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Este mini-projeto demonstra como desacoplar o ERP das jornadas críticas: cache de produtos,
              reserva de estoque transacional, idempotência distribuída com Redis e simulação de falha no ERP.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatusMessage tone="info" title="Vitrine performática" description="Produtos servidos via API local com paginação e filtros, evitando chamadas diretas ao ERP." />
            <StatusMessage tone="success" title="Estoque confiável" description="Reservas atômicas + lock distribúido no Redis impedem overselling em cenários concorrentes." />
            <StatusMessage tone="warning" title="ERP instável" description="Pedidos enfrentam latência aleatória; respostas são categorizadas e comunicadas ao cliente." />
          </div>
        </div>

        <LoginPanel />
      </section>

      <ProductGrid onSelect={setSelectedProduct} selectedProductId={selectedProduct?.id} />

      <CheckoutForm product={selectedProduct} />

      <section className="mb-16 grid gap-6 rounded-3xl border border-white/10 bg-brand-dark/70 p-6 text-white shadow-xl md:grid-cols-3">
        <FeatureCard
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Idempotência no backend"
          description="Cada tentativa envia uma `Idempotency-Key`. Respostas são cacheadas temporariamente em Redis e reusadas."/>
        <FeatureCard
          icon={<RefreshCw className="h-6 w-6" />}
          title="Retries conscientes"
          description="Falhas técnicas não reduzem estoque. Usuário recebe orientação para tentar novamente sem prejuízo."/>
        <FeatureCard
          icon={<Zap className="h-6 w-6" />}
          title="Observabilidade"
          description="Logs estruturados em JSON e endpoint de health check garantem rastreabilidade por pedido."/>
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
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/15 text-brand-secondary">
        {icon}
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  );
}
