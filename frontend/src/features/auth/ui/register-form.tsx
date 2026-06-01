"use client";

import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerUser } from '@/features/auth/api/register';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useAppDispatch } from '@/shared/store/hooks';
import { setCredentials } from '@/features/auth/model/auth-slice';
import { StatusMessage } from '@/shared/ui/status-message';

interface RegisterFormValues {
  email: string;
  password: string;
}

const PASSWORD_HINT = 'Use letras maiúsculas, minúsculas, números e um caractere especial.';

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      router.push('/');
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-xl transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl text-neutral-900 dark:text-slate-100">Criar conta</h1>
        <p className="text-sm text-neutral-500 dark:text-slate-300">
          Cadastre-se para acessar o carrinho inteligente, finalizar pedidos e acompanhar o status do checkout.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          {...form.register('email', { required: 'Informe o e-mail' })}
          error={form.formState.errors.email?.message}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          helperText={PASSWORD_HINT}
          {...form.register('password', {
            required: 'Informe a senha',
            minLength: { value: 10, message: 'Mínimo de 10 caracteres.' },
          })}
          error={form.formState.errors.password?.message}
        />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Criar e acessar
        </Button>
      </form>

      {mutation.isError ? (
        <div className="mt-4">
          <StatusMessage
            tone="error"
            title="Cadastro não realizado"
            description="Verifique se o e-mail já está em uso ou se a senha atende aos critérios."
          />
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="mt-4">
          <StatusMessage tone="success" title="Conta criada" description="Redirecionando para a vitrine." />
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-slate-300">
        Já possui conta?{' '}
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          Faça login
        </Link>
      </p>
    </div>
  );
}
