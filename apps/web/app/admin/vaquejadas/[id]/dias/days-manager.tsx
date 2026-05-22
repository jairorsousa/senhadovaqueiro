"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, DataTable, Input } from "@senha-do-vaqueiro/ui";
import { createDay, listDays, type DayPayload } from "../../../../../lib/admin-event-setup";

const initialForm = {
  name: "",
  startsAt: "",
  endsAt: "",
  sortOrder: "0"
};

export function DaysManager({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-days", eventId],
    queryFn: () => listDays(eventId)
  });
  const mutation = useMutation({
    mutationFn: (payload: DayPayload) => createDay(eventId, payload),
    onSuccess: async () => {
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-days", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] });
    }
  });

  function submit() {
    mutation.mutate({
      name: form.name,
      startsAt: new Date(form.startsAt).toISOString(),
      ...(form.endsAt ? { endsAt: new Date(form.endsAt).toISOString() } : {}),
      sortOrder: Number(form.sortOrder || 0)
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Agenda da vaquejada</p>
        <h2 className="text-2xl">Dias</h2>
      </div>

      <form
        className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Input
          label="Nome"
          value={form.name}
          onChange={(event) => setFormValue(setForm, "name", event.target.value)}
          required
        />
        <Input
          label="Ordem"
          type="number"
          min={0}
          value={form.sortOrder}
          onChange={(event) => setFormValue(setForm, "sortOrder", event.target.value)}
        />
        <Input
          label="Início"
          type="datetime-local"
          value={form.startsAt}
          onChange={(event) => setFormValue(setForm, "startsAt", event.target.value)}
          required
        />
        <Input
          label="Fim"
          type="datetime-local"
          value={form.endsAt}
          onChange={(event) => setFormValue(setForm, "endsAt", event.target.value)}
        />
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" loading={mutation.isPending}>
            <CalendarPlus aria-hidden="true" className="h-4 w-4" />
            Salvar dia
          </Button>
        </div>
      </form>

      <DataTable
        columns={[
          { key: "name", header: "Dia", cell: (day) => <strong>{day.name}</strong> },
          { key: "startsAt", header: "Início", cell: (day) => formatDate(day.startsAt) },
          {
            key: "endsAt",
            header: "Fim",
            cell: (day) => (day.endsAt ? formatDate(day.endsAt) : "-")
          },
          {
            key: "maps",
            header: "Mapas",
            cell: (day) => <Badge variant="info">{day.counts.ticketMaps} mapas</Badge>
          },
          { key: "categories", header: "Categorias", cell: (day) => day.counts.categories }
        ]}
        data={data?.days ?? []}
        emptyMessage={isLoading ? "Carregando dias..." : "Nenhum dia cadastrado."}
      />
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );
}

function setFormValue<T extends Record<string, string>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  value: string
) {
  setForm((current) => ({ ...current, [field]: value }));
}
