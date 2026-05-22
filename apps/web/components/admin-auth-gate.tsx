"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@senha-do-vaqueiro/ui";
import { getAdminSession, loginAdmin } from "../lib/admin-auth";

type ApiError = {
  error?: {
    message?: string;
  };
};

export function AdminAuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: getAdminSession,
    retry: false
  });

  if (sessionQuery.isLoading) {
    return (
      <main className="light grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <Card className="w-full max-w-md">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Verificando sessão administrativa...
          </CardContent>
        </Card>
      </main>
    );
  }

  if (sessionQuery.error || !sessionQuery.data) {
    return (
      <AdminLoginScreen
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["admin-session"] });
        }}
      />
    );
  }

  return children;
}

function AdminLoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useMutation({
    mutationFn: () => loginAdmin({ email, password }),
    onSuccess
  });

  const error = loginMutation.error as ApiError | null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate();
  }

  return (
    <main className="light grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 grid h-11 w-11 place-items-center rounded-md bg-primary/12 text-primary">
            <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          </div>
          <CardTitle>Acesso administrativo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha para gerenciar as vaquejadas.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Senha"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error.error?.message ?? "Nao foi possivel entrar. Verifique os dados."}
              </p>
            ) : null}
            <Button type="submit" className="w-full" loading={loginMutation.isPending}>
              <LogIn aria-hidden="true" className="h-4 w-4" />
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
