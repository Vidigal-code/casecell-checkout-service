"use client";

import { useEffect, useMemo, useState, useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deactivateAdminProduct,
  AdminProduct,
  AdminProductPayload,
} from '@/shared/api/admin-products';
import Image from 'next/image';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { StatusMessage } from '@/shared/ui/status-message';
import { Skeleton } from '@/shared/ui/skeleton';
import { Modal } from '@/shared/ui/modal';
import { formatCurrency } from '@/shared/lib/format-currency';

const PAGE_SIZE = 8;

const DEFAULT_VALUES: AdminProductPayload = {
  name: '',
  description: '',
  sku: '',
  priceCents: 0,
  stock: 0,
  imageUrl: '',
  isActive: true,
};

const ACTION_FEEDBACK = {
  create: {
    tone: 'success' as const,
    title: 'Produto cadastrado',
    description: 'A vitrine foi atualizada com o novo item.',
  },
  update: {
    tone: 'success' as const,
    title: 'Produto atualizado',
    description: 'Alterações persistidas com sucesso.',
  },
  deactivate: {
    tone: 'warning' as const,
    title: 'Produto desativado',
    description: 'O item não estará mais disponível no checkout.',
  },
};

type ActiveModal = 'create' | 'edit' | null;
type ActionKey = keyof typeof ACTION_FEEDBACK;

export function AdminProductsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [lastAction, setLastAction] = useState<ActionKey | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const reactId = useId();
  const formId = `admin-product-form-${reactId.replace(/:/g, '')}`;

  const form = useForm<AdminProductPayload>({
    defaultValues: DEFAULT_VALUES,
  });

  const imageUrlValue = useWatch({ control: form.control, name: 'imageUrl' });

  useEffect(() => {
    setPreviewError(false);
  }, [imageUrlValue]);

  const productsQuery = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => fetchAdminProducts({ page, pageSize: PAGE_SIZE, search }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      productsQuery.refetch();
      setLastAction('create');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminProductPayload> }) =>
      updateAdminProduct(id, payload),
    onSuccess: () => {
      productsQuery.refetch();
      setLastAction('update');
      closeModal();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminProduct,
    onSuccess: () => {
      productsQuery.refetch();
      setLastAction('deactivate');
    },
  });

  const totalPages = useMemo(() => {
    if (!productsQuery.data || productsQuery.data.total === 0) {
      return 1;
    }
    return Math.max(Math.ceil(productsQuery.data.total / PAGE_SIZE), 1);
  }, [productsQuery.data]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const openCreateModal = () => {
    setActiveModal('create');
    setEditing(null);
    setLastAction(null);
    form.reset(DEFAULT_VALUES);
  };

  const openEditModal = (product: AdminProduct) => {
    setActiveModal('edit');
    setEditing(product);
    setLastAction(null);
    form.reset({
      name: product.name,
      description: product.description,
      sku: product.sku,
      priceCents: product.priceCents,
      stock: product.stock,
      imageUrl: product.imageUrl ?? '',
      isActive: product.isActive,
    });
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditing(null);
    form.reset(DEFAULT_VALUES);
    setPreviewError(false);
  };

  const handleModalClose = () => {
    if (isSubmitting) {
      return;
    }
    closeModal();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: AdminProductPayload = {
      ...values,
      priceCents: Number(values.priceCents),
      stock: Number(values.stock),
      imageUrl: values.imageUrl?.trim() ? values.imageUrl.trim() : undefined,
    };

    if (activeModal === 'edit' && editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  });

  const feedback = lastAction ? ACTION_FEEDBACK[lastAction] : null;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-gradient-to-br from-white/95 via-white/90 to-white/70 p-8 shadow-xl transition-colors dark:border-neutral-700 dark:from-neutral-900/95 dark:via-neutral-900/90 dark:to-neutral-900/80 dark:shadow-black/50">
        <div className="space-y-2">
          <h2 className="font-display text-3xl text-neutral-900 dark:text-slate-100">Gestão de catálogo</h2>
          <p className="max-w-2xl text-sm text-neutral-500 dark:text-slate-300">
            Cadastre produtos com imagens, acompanhe estoque e mantenha a vitrine alinhada ao ERP. Todas as ações são auditáveis e aplicadas em tempo real.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" onClick={openCreateModal}>
            Novo produto
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              productsQuery.refetch();
              setLastAction(null);
            }}
            loading={productsQuery.isRefetching}
          >
            Sincronizar catálogo
          </Button>
        </div>
      </div>

      {feedback ? (
        <StatusMessage tone={feedback.tone} title={feedback.title} description={feedback.description} />
      ) : null}

      <div className="rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/80 dark:shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-xl text-neutral-900 dark:text-slate-100">Catálogo ativo</h3>
            <p className="text-sm text-neutral-500 dark:text-slate-300">Pesquise por nome, descrição ou SKU para localizar rapidamente.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Input
              placeholder="Buscar produtos"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>
        </div>

        {productsQuery.isPending ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : null}

        {productsQuery.isError ? (
          <div className="mt-6">
            <StatusMessage tone="error" title="Erro ao carregar" description="Tente novamente em instantes." />
          </div>
        ) : null}

        {productsQuery.data && !productsQuery.isPending ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-sm text-neutral-600 dark:divide-neutral-700 dark:text-slate-300">
              <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/70 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Preço</th>
                  <th className="px-4 py-3 text-left">Estoque</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {productsQuery.data.data.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail name={product.name} imageUrl={product.imageUrl} />
                        <div>
                          <p className="font-semibold text-neutral-800 dark:text-slate-200">{product.name}</p>
                          <p className="text-xs text-neutral-400 dark:text-slate-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-slate-400">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-slate-300">{formatCurrency(product.priceCents / 100)}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-slate-300">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                            : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-slate-300'
                        }`}
                      >
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => openEditModal(product)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                          loading={deactivateMutation.isPending && deactivateMutation.variables === product.id}
                          onClick={() => deactivateMutation.mutate(product.id)}
                        >
                          Desativar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {productsQuery.data && productsQuery.data.total > 0 ? (
          <div className="mt-6 flex w-full flex-col items-center gap-3 text-center md:flex-row md:justify-between md:text-left">
            <span className="text-sm text-neutral-500 dark:text-slate-300">
              Página {page} de {totalPages}
            </span>
            <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row md:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="w-full md:w-auto"
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="w-full md:w-auto"
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={activeModal !== null}
        onClose={handleModalClose}
        title={activeModal === 'edit' ? 'Editar produto' : 'Cadastrar produto'}
        description={
          activeModal === 'edit'
            ? 'Atualize preço, estoque ou imagem com sincronização imediata para o checkout.'
            : 'Defina todos os campos obrigatórios para disponibilizar o item na vitrine.'
        }
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleModalClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form={formId} loading={isSubmitting}>
              {activeModal === 'edit' ? 'Salvar alterações' : 'Cadastrar produto'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <Input label="Nome" {...form.register('name', { required: 'Informe o nome' })} error={form.formState.errors.name?.message} />
          </div>
          <div>
            <Input label="SKU" {...form.register('sku', { required: 'Informe o SKU' })} error={form.formState.errors.sku?.message} />
          </div>
          <div>
            <Input
              label="Preço (centavos)"
              type="number"
              min={0}
              {...form.register('priceCents', {
                valueAsNumber: true,
                min: { value: 0, message: 'Preço inválido' },
              })}
              error={form.formState.errors.priceCents?.message}
            />
          </div>
          <div>
            <Input
              label="Estoque"
              type="number"
              min={0}
              {...form.register('stock', { valueAsNumber: true, min: { value: 0, message: 'Estoque inválido' } })}
              error={form.formState.errors.stock?.message}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Imagem (URL)"
              {...form.register('imageUrl')}
              helperText="Opcional: vincule uma imagem hospedada de forma pública."
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Descrição"
              {...form.register('description', { required: 'Informe a descrição' })}
              error={form.formState.errors.description?.message}
              rows={5}
            />
          </div>
          <div className="md:col-span-2 grid gap-4 md:grid-cols-[auto,1fr]">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/70">
              <input type="checkbox" id="isActive" {...form.register('isActive')} className="h-4 w-4" />
              <label htmlFor="isActive" className="text-sm text-neutral-600 dark:text-slate-300">
                Ativar produto imediatamente na vitrine
              </label>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                {imageUrlValue && !previewError ? (
                  <Image
                    src={imageUrlValue}
                    alt="Pré-visualização da imagem"
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setPreviewError(true)}
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500 dark:text-slate-400">
                    Prévia indisponível
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-slate-400">
                Prefira imagens quadradas acima de 640px hospedadas em CDN segura.
              </p>
            </div>
          </div>
          {createMutation.isError || updateMutation.isError ? (
            <div className="md:col-span-2">
              <StatusMessage tone="error" title="Erro ao salvar" description="Não foi possível persistir o produto. Tente novamente." />
            </div>
          ) : null}
        </form>
      </Modal>
    </section>
  );
}

function ProductThumbnail({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const initials = name.trim().substring(0, 2).toUpperCase();

  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300">
      {imageUrl && !failed ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          unoptimized
          onError={() => setFailed(true)}
          sizes="48px"
        />
      ) : (
        <span>{initials || '--'}</span>
      )}
    </div>
  );
}
