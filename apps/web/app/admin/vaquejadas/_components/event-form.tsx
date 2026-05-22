"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Select, Textarea } from "@senha-do-vaqueiro/ui";
import {
  type AdminEvent,
  type ApiError,
  createAdminEvent,
  type EventPayload,
  updateAdminEvent
} from "../../../../lib/admin-events";

type EventFormState = {
  name: string;
  city: string;
  state: string;
  location: string;
  description: string;
  rules: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  status: "DRAFT" | "CANCELLED";
};

const emptyState: EventFormState = {
  name: "",
  city: "",
  state: "",
  location: "",
  description: "",
  rules: "",
  bannerUrl: "",
  startsAt: "",
  endsAt: "",
  status: "DRAFT"
};

export function EventForm({ event }: { event?: AdminEvent }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EventFormState>(() => eventToForm(event));
  const [apiError, setApiError] = useState<string | null>(null);

  const isEditing = Boolean(event);
  const canCancel = event?.status !== "CANCELLED";
  const mutation = useMutation({
    mutationFn: async (payload: EventPayload) =>
      event ? updateAdminEvent(event.id, payload) : createAdminEvent(payload),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", saved.id] });
      router.push(`/admin/vaquejadas/${saved.id}`);
    },
    onError: (error: ApiError) => {
      setApiError(error.error?.message ?? "Nao foi possivel salvar a vaquejada.");
    }
  });

  const requiredMissing = useMemo(
    () =>
      !form.name || !form.city || !form.state || !form.location || !form.startsAt || !form.endsAt,
    [form]
  );

  function updateField(field: keyof EventFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value
    }));
  }

  function submit(status?: "CANCELLED") {
    setApiError(null);
    mutation.mutate(toPayload(form, status));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Administração de vaquejada</p>
          <h2 className="text-2xl">{isEditing ? "Editar vaquejada" : "Nova vaquejada"}</h2>
        </div>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/vaquejadas")}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {apiError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {apiError}
        </div>
      ) : null}

      <form
        className="grid gap-5 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-2"
        onSubmit={(submitEvent) => {
          submitEvent.preventDefault();
          submit();
        }}
      >
        <Input
          label="Nome"
          name="name"
          value={form.name}
          onChange={(inputEvent) => updateField("name", inputEvent.target.value)}
          placeholder="Vaquejada Parque Modelo"
          required
        />
        <Input
          label="Cidade"
          name="city"
          value={form.city}
          onChange={(inputEvent) => updateField("city", inputEvent.target.value)}
          placeholder="Petrolina"
          required
        />
        <Input
          label="Estado"
          name="state"
          value={form.state}
          onChange={(inputEvent) => updateField("state", inputEvent.target.value)}
          placeholder="PE"
          maxLength={2}
          required
        />
        <Input
          label="Local"
          name="location"
          value={form.location}
          onChange={(inputEvent) => updateField("location", inputEvent.target.value)}
          placeholder="Parque de vaquejada"
          required
        />
        <Input
          label="Início"
          name="startsAt"
          type="datetime-local"
          value={form.startsAt}
          onChange={(inputEvent) => updateField("startsAt", inputEvent.target.value)}
          required
        />
        <Input
          label="Fim"
          name="endsAt"
          type="datetime-local"
          value={form.endsAt}
          onChange={(inputEvent) => updateField("endsAt", inputEvent.target.value)}
          required
        />
        <Input
          className="md:col-span-2"
          label="URL do banner"
          name="bannerUrl"
          value={form.bannerUrl}
          onChange={(inputEvent) => updateField("bannerUrl", inputEvent.target.value)}
          placeholder="https://..."
        />
        <Textarea
          label="Descrição"
          name="description"
          value={form.description}
          onChange={(inputEvent) => updateField("description", inputEvent.target.value)}
          className="md:col-span-2"
        />
        <Textarea
          label="Regulamento"
          name="rules"
          value={form.rules}
          onChange={(inputEvent) => updateField("rules", inputEvent.target.value)}
          className="md:col-span-2"
        />
        {isEditing ? (
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(inputEvent) => updateField("status", inputEvent.target.value)}
          >
            <option value="DRAFT">Rascunho</option>
            <option value="CANCELLED">Cancelada</option>
          </Select>
        ) : null}
        <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
          {isEditing && canCancel ? (
            <Button
              type="button"
              variant="destructive"
              loading={mutation.isPending}
              onClick={() => submit("CANCELLED")}
            >
              <XCircle aria-hidden="true" className="h-4 w-4" />
              Cancelar vaquejada
            </Button>
          ) : null}
          <Button type="submit" loading={mutation.isPending} disabled={requiredMissing}>
            <Save aria-hidden="true" className="h-4 w-4" />
            Salvar rascunho
          </Button>
        </div>
      </form>
    </div>
  );
}

function eventToForm(event?: AdminEvent): EventFormState {
  if (!event) {
    return emptyState;
  }

  return {
    name: event.name,
    city: event.city,
    state: event.state,
    location: event.location,
    description: event.description ?? "",
    rules: event.rules ?? "",
    bannerUrl: event.bannerUrl ?? "",
    startsAt: toDateTimeLocal(event.startsAt),
    endsAt: toDateTimeLocal(event.endsAt),
    status: event.status === "CANCELLED" ? "CANCELLED" : "DRAFT"
  };
}

function toPayload(form: EventFormState, status?: "CANCELLED"): EventPayload {
  const shouldCancel = status === "CANCELLED" || form.status === "CANCELLED";

  return {
    name: form.name,
    city: form.city,
    state: form.state,
    location: form.location,
    description: form.description,
    rules: form.rules,
    bannerUrl: form.bannerUrl,
    startsAt: new Date(form.startsAt).toISOString(),
    endsAt: new Date(form.endsAt).toISOString(),
    ...(shouldCancel ? { status: "CANCELLED" as const } : {})
  };
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
