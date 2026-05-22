"use client";

import { useState } from "react";
import { Button, Input } from "@senha-do-vaqueiro/ui";

export type IdentificationPayload = {
  name: string;
  cpf: string;
  whatsapp: string;
  password: string;
};

const initialForm: IdentificationPayload = {
  name: "",
  cpf: "",
  whatsapp: "",
  password: ""
};

export function IdentificationStep({
  onSubmit,
  loading
}: {
  onSubmit: (payload: IdentificationPayload) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initialForm);

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <Input
        label="Nome"
        value={form.name}
        onChange={(event) => setFormValue(setForm, "name", event.target.value)}
        required
      />
      <Input
        label="CPF"
        value={form.cpf}
        onChange={(event) => setFormValue(setForm, "cpf", event.target.value)}
        required
      />
      <Input
        label="WhatsApp"
        value={form.whatsapp}
        onChange={(event) => setFormValue(setForm, "whatsapp", event.target.value)}
        required
      />
      <Input
        label="Senha"
        type="password"
        minLength={8}
        value={form.password}
        onChange={(event) => setFormValue(setForm, "password", event.target.value)}
        required
      />
      <div className="md:col-span-2">
        <Button type="submit" loading={loading}>
          Continuar
        </Button>
      </div>
    </form>
  );
}

function setFormValue<T extends Record<string, string>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  value: string
) {
  setForm((current) => ({ ...current, [field]: value }));
}
