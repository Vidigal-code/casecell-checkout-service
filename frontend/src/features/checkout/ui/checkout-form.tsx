"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Product } from '@/entities/product/model/types';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { submitCheckout, CheckoutResponse, CheckoutPayload } from '@/shared/api/checkout';
import { fetchOrderStatus, OrderStatusResponse } from '@/shared/api/orders';
import { StatusMessage } from '@/shared/ui/status-message';
import { formatCurrency } from '@/shared/lib/format-currency';
import { useAppSelector } from '@/shared/store/hooks';
import { selectIsAuthenticated } from '@/features/auth/model/selectors';

interface CheckoutFormProps {
  product?: Product;
}

interface CheckoutFormValues {
  quantity: number;
}

const DEFAULT_VALUES: CheckoutFormValues = {
  quantity: 1,
};

export function CheckoutForm({ product }: CheckoutFormProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<CheckoutResponse | null>(null);

  const form = useForm<CheckoutFormValues>({ defaultValues: DEFAULT_VALUES, mode: 'onChange' });

  useEffect(() => {
    form.reset(DEFAULT_VALUES);
    setOrderId(null);
    setLastResponse(null);
  }, [product?.id, form]);

  const orderStatusQuery = useQuery<OrderStatusResponse | undefined, Error>({
    queryKey: ['order-status', orderId],
    queryFn: () => fetchOrderStatus(orderId!),
    enabled: Boolean(orderId),
    refetchInterval: lastResponse?.status === 'SUCCESS' ? 4000 : false,
  });

  const mutation = useMutation<CheckoutResponse, Error, CheckoutPayload>({
    mutationFn: submitCheckout,
    onSuccess: (response) => {
      setLastResponse(response);
      if (response.orderId) {
        setOrderId(response.orderId);
      }
    },
    onError: (error) => {
      const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setLastResponse({
        status: 'ERROR',
        message: apiMessage ?? error.message ?? 'Falha inesperada no checkout.',
      });
    },
  });

  const total = useMemo(() => {
    if (!product) return 0;
    const quantity = form.watch('quantity') ?? 1;
    return (product.priceCents / 100) * quantity;
  }, [product, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!product) return;
    await mutation.mutateAsync({ productId: product.id, quantity: values.quantity });
  });

  const renderStatus = () => {
    if (mutation.isPending) {
      return (
        <StatusMessage
          tone="info"
          title="Processando..."
          description="Reservando estoque e sincronizando com o ERP."
        />
      );
    }

    if (lastResponse?.status === 'SUCCESS') {
      return (
        <StatusMessage
          tone="success"
          title={lastResponse.message}
          description={
            <span>
              Pedido #{lastResponse.orderId} em status{' '}
              <strong>{orderStatusQuery.data?.status ?? 'PROCESSING'}</strong>.
            </span>
          }
        />
      );
    }

    if (lastResponse?.status === 'INSUFFICIENT_STOCK') {
      return (
        <StatusMessage
          tone="warning"
          title="Estoque insuficiente"
          description="Outro cliente finalizou a reserva antes de você. Ajuste a quantidade ou tente novamente em instantes."
        />
      );
    }

    if (lastResponse?.duplicate) {
      return (
        <StatusMessage
          tone="info"
          title="Pedido já processado"
          description="Reaproveitamos o resultado anterior para evitar cobranças duplicadas."
        />
      );
    }

    if (lastResponse?.status === 'TECHNICAL_FAILURE') {
      return (
        <StatusMessage
          tone="error"
          title="Falha temporária"
          description="O ERP demorou mais que o esperado. Nenhum estoque foi debitado e você pode tentar novamente."
        />
      );
    }

    if (lastResponse && lastResponse.status !== 'SUCCESS') {
      return <StatusMessage tone="error" title="Erro" description={lastResponse.message} />;
    }

    return null;
  };

  return (
    <section id="checkout" className="space-y-6">
      <div className="glass-panel space-y-5 rounded-3xl p-6 text-white">
        <header className="space-y-2">
          <h2 className="font-display text-2xl">Checkout resiliente</h2>
          <p className="text-sm text-white/70">
            Reservamos estoque de forma atômica, simulamos atrasos do ERP e evitamos pedidos duplicados com chaves de
            idempotência.
          </p>
        </header>

        {!product ? (
          <StatusMessage tone="info" title="Selecione um produto acima para iniciar a compra." />
        ) : (
          <div className="space-y-4">
            {!isAuthenticated ? (
              <StatusMessage
                tone="warning"
                title="Faça login para finalizar"
                description="Use o painel de login acima para receber tokens e testar o fluxo completo."
              />
            ) : null}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Produto" value={product.name} readOnly className="bg-white/20 text-white" />
                <Input
                  label="Quantidade"
                  type="number"
                  min={1}
                  max={product.stock}
                  {...form.register('quantity', {
                    valueAsNumber: true,
                    min: 1,
                    max: product.stock,
                  })}
                  error={form.formState.errors.quantity ? 'Quantidade inválida para o estoque atual.' : undefined}
                />
              </div>

              <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span>Total estimado</span>
                <strong className="font-display text-lg text-brand-secondary">{formatCurrency(total)}</strong>
              </div>

              <Button
                type="submit"
                loading={mutation.isPending}
                disabled={!product || !isAuthenticated}
                className="w-full sm:w-auto"
              >
                Confirmar compra
              </Button>
            </form>
          </div>
        )}
      </div>

      {renderStatus()}
    </section>
  );
}
