"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/api/login";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAppDispatch } from "@/shared/store/hooks";
import { setCredentials } from "@/features/auth/model/auth-slice";
import { StatusMessage } from "@/shared/ui/status-message";
import { routes } from "@/shared/config/routes";
import { getPostAuthRedirect } from "@/shared/lib/auth-navigation";

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      router.push(getPostAuthRedirect(data.user));
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-xl transition-colors dark:border-neutral-700 dark:bg-neutral-900/70 dark:shadow-black/40">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl text-neutral-900 dark:text-slate-100">
          Entrar
        </h1>
        <p className="text-sm text-neutral-500 dark:text-slate-300">
          Acesse com seu e-mail e senha forte cadastrados. Use as credenciais
          seed ou crie uma nova conta.
        </p>
      </header>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          {...form.register("email", { required: "Informe o e-mail" })}
          error={form.formState.errors.email?.message}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          {...form.register("password", { required: "Informe a senha" })}
          error={form.formState.errors.password?.message}
        />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Acessar conta
        </Button>
      </form>

      {mutation.isError ? (
        <div className="mt-4">
          <StatusMessage
            tone="error"
            title="Credenciais inválidas"
            description="Confirme se o e-mail e a senha forte estão corretos."
          />
        </div>
      ) : null}

      {mutation.isSuccess ? (
        <div className="mt-4">
          <StatusMessage
            tone="success"
            title="Login realizado"
            description="Redirecionando para a vitrine."
          />
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-slate-300">
        Ainda não tem conta?{" "}
        <Link
          href={routes.register}
          className="font-medium text-brand-primary hover:underline"
        >
          Crie uma agora
        </Link>
      </p>
    </div>
  );
}
