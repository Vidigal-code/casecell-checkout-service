"use client";

import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { login } from '@/features/auth/api/login';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAppDispatch } from '@/shared/store/hooks';
import { setCredentials } from '@/features/auth/model/auth-slice';
import { StatusMessage } from '@/shared/ui/status-message';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPanel() {
  const dispatch = useAppDispatch();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: 'customer@casecell.shop',
      password: 'customer123',
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <section id="login" className="glass-panel rounded-3xl p-6 text-white shadow-xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="space-y-2">
          <h2 className="font-display text-2xl">Faça login para testar o checkout</h2>
          <p className="text-sm text-white/70">
            Use as credenciais seedadas para o desafio ou configure as suas via seed do Prisma.
          </p>
        </header>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="E-mail" type="email" {...form.register('email', { required: 'Informe o e-mail' })} error={form.formState.errors.email?.message} />
          <Input
            label="Senha"
            type="password"
            {...form.register('password', { required: 'Informe a senha' })}
            error={form.formState.errors.password?.message}
          />
          <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
            Entrar como cliente
          </Button>
        </form>

        {mutation.isError ? (
          <div className="mt-4">
            <StatusMessage tone="error" title="Credenciais inválidas" description="Confira se o e-mail e senha foram preenchidos corretamente." />
          </div>
        ) : null}

        {mutation.isSuccess ? (
          <div className="mt-4">
            <StatusMessage tone="success" title="Login realizado" description="Agora você pode reservar estoque e finalizar compras." />
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
