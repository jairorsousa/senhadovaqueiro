"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Card, CardContent, Input } from "@senha-do-vaqueiro/ui";
import { loginCowboy } from "../../../lib/cowboy-auth";
import type { CheckoutApiError } from "../../../lib/checkout";

export function CowboyLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useMutation({
    mutationFn: () => loginCowboy({ cpf, password }),
    onSuccess
  });
  const error = loginMutation.error as CheckoutApiError | null;

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div>
          <h2 className="text-xl">Entrar como vaqueiro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use o CPF e a senha cadastrados no checkout.
          </p>
        </div>
        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error.error?.message ?? "Nao foi possivel entrar."}
          </div>
        ) : null}
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate();
          }}
        >
          <Input
            label="CPF"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            inputMode="numeric"
            required
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
