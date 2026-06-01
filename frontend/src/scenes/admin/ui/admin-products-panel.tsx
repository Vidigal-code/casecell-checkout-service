"use client";

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deactivateAdminProduct,
  AdminProduct,
  AdminProductPayload,
} from '@/shared/api/admin-products';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { StatusMessage } from '@/shared/ui/status-message';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatCurrency } from '@/shared/lib/format-currency';

const PAGE_SIZE = 8;

export function AdminProductsPanel() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [lastAction, setLastAction] = useState<'create' | 'update' | null>(null);

  const form = useForm<AdminProductPayload>({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      priceCents: 0,
      stock: 0,
      imageUrl: '',
      isActive: true,
    },
  });

  const productsQuery = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => fetchAdminProducts({ page, pageSize: PAGE_SIZE, search }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      form.reset();
      productsQuery.refetch();
      setLastAction('create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminProductPayload> }) =>
      updateAdminProduct(id, payload),
    onSuccess: () => {
      setEditing(null);
      form.reset({
        name: '',
        description: '',
        sku: '',
        priceCents: 0,
        stock: 0,
        imageUrl: '',
        isActive: true,
      });
      productsQuery.refetch();
      setLastAction('update');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminProduct,
    onSuccess: () => {
      productsQuery.refetch();
    },
  });

  const totalPages = useMemo(() => {
    if (!productsQuery.data || productsQuery.data.total === 0) return 1;
    return Math.max(Math.ceil(productsQuery.data.total / PAGE_SIZE), 1);
  }, [productsQuery.data]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: AdminProductPayload = {
      ...values,
      priceCents: Number(values.priceCents),
      stock: Number(values.stock),
    };

    setLastAction(null);
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  });

  const handleEdit = (product: AdminProduct) => {
    setEditing(product);
    setLastAction(null);
    form.reset({
      name: product.name,
      description: product.description,
      sku: product.sku,
      priceCents: product.priceCents,
      stock: product.stock,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    });
  };

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-neutral-900 dark:text-slate-100">
              {editing ? 'Editar produto' : 'Cadastrar produto'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-slate-300">
              Defina preço em centavos e estoque disponível. Campos obrigatórios marcados com validação automática.
            </p>
          </div>
          {editing ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditing(null);
                form.reset({
                  name: '',
                  description: '',
                  sku: '',
                  priceCents: 0,
                  stock: 0,
                  imageUrl: '',
                  isActive: true,
                });
              }}
            >
              Cancelar edição
            </Button>
          ) : null}
        </header>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <Input label="Nome" {...form.register('name', { required: 'Informe o nome' })} error={form.formState.errors.name?.message} />
          <Input label="SKU" {...form.register('sku', { required: 'Informe o SKU' })} error={form.formState.errors.sku?.message} />
          <Input
            label="Preço (centavos)"
            type="number"
            min={0}
            {...form.register('priceCents', { valueAsNumber: true, min: { value: 0, message: 'Preço inválido' } })}
            error={form.formState.errors.priceCents?.message}
          />
          <Input
            label="Estoque"
            type="number"
            min={0}
            {...form.register('stock', { valueAsNumber: true, min: { value: 0, message: 'Estoque inválido' } })}
            error={form.formState.errors.stock?.message}
          />
          <Input
            label="Imagem (URL)"
            {...form.register('imageUrl')}
            helperText="Opcional: link de imagem. Se vazio, usamos fallback automático."
          />
          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/70">
            <input type="checkbox" id="isActive" {...form.register('isActive')} className="h-4 w-4" />
            <label htmlFor="isActive" className="text-sm text-neutral-600 dark:text-slate-300">
              Ativar produto imediatamente na vitrine
            </label>
          </div>
          <div className="md:col-span-2">
            <Input
              label="Descrição"
              {...form.register('description', { required: 'Informe a descrição' })}
              error={form.formState.errors.description?.message}
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Salvar alterações' : 'Cadastrar produto'}
            </Button>
          </div>
        </form>

        {createMutation.isError || updateMutation.isError ? (
          <div className="mt-4">
            <StatusMessage tone="error" title="Erro" description="Não foi possível salvar o produto." />
          </div>
        ) : null}

        {lastAction === 'create' ? (
          <div className="mt-4">
            <StatusMessage tone="success" title="Produto cadastrado" description="A vitrine foi atualizada." />
          </div>
        ) : null}

        {lastAction === 'update' ? (
          <div className="mt-4">
            <StatusMessage tone="success" title="Produto atualizado" description="Alterações persistidas com sucesso." />
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white/95 p-6 shadow-lg transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-display text-xl text-neutral-900 dark:text-slate-100">Catálogo</h3>
            <p className="text-sm text-neutral-500 dark:text-slate-300">Pesquise por nome, descrição ou SKU.</p>
          </div>
          <Input
            placeholder="Buscar produtos"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />
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
                  <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-4 py-3 font-medium text-neutral-800 dark:text-slate-200">{product.name}</td>
                    <td className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-neutral-400 dark:text-slate-400">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-slate-300">{formatCurrency(product.priceCents / 100)}</td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-slate-300">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                        <Button type="button" variant="secondary" onClick={() => handleEdit(product)}>
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
    </section>
  );
}
