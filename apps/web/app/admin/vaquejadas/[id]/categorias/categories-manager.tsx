"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, DataTable, Input, Select, Textarea } from "@senha-do-vaqueiro/ui";
import {
  createCategory,
  listCategories,
  updateCategory,
  type AdminCategory,
  type CategoryPayload
} from "../../../../../lib/admin-event-setup";

const initialForm = {
  name: "",
  description: "",
  ticketPrice: "",
  prizeAmount: "",
  cattleCount: "",
  usesDays: "false",
  status: "ACTIVE",
  sortOrder: "0"
};

export function CategoriesManager({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-categories", eventId],
    queryFn: () => listCategories(eventId)
  });
  const mutation = useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(eventId, payload),
    onSuccess: async () => {
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-categories", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] });
    }
  });
  const toggleStatus = useMutation({
    mutationFn: (category: AdminCategory) =>
      updateCategory(category.id, { status: category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] });
    }
  });

  function submit() {
    const payload: CategoryPayload = {
      name: form.name,
      description: form.description,
      ticketPrice: form.ticketPrice,
      prizeAmount: form.prizeAmount,
      usesDays: form.usesDays === "true",
      status: form.status as NonNullable<CategoryPayload["status"]>,
      sortOrder: Number(form.sortOrder || 0)
    };

    if (form.cattleCount) {
      payload.cattleCount = Number(form.cattleCount);
    }

    mutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Configuração comercial</p>
        <h2 className="text-2xl">Categorias</h2>
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
          label="Valor da senha"
          value={form.ticketPrice}
          onChange={(event) => setFormValue(setForm, "ticketPrice", event.target.value)}
          placeholder="250.00"
          required
        />
        <Input
          label="Premiação"
          value={form.prizeAmount}
          onChange={(event) => setFormValue(setForm, "prizeAmount", event.target.value)}
          placeholder="10000.00"
        />
        <Input
          label="Quantidade de bois"
          type="number"
          min={0}
          value={form.cattleCount}
          onChange={(event) => setFormValue(setForm, "cattleCount", event.target.value)}
        />
        <Select
          label="Organização por dia"
          value={form.usesDays}
          onChange={(event) => setFormValue(setForm, "usesDays", event.target.value)}
        >
          <option value="false">Mapa direto</option>
          <option value="true">Exige escolha do dia</option>
        </Select>
        <Select
          label="Status"
          value={form.status}
          onChange={(event) => setFormValue(setForm, "status", event.target.value)}
        >
          <option value="ACTIVE">Ativa</option>
          <option value="DRAFT">Rascunho</option>
          <option value="INACTIVE">Inativa</option>
        </Select>
        <Textarea
          label="Descrição"
          value={form.description}
          onChange={(event) => setFormValue(setForm, "description", event.target.value)}
          className="md:col-span-2"
        />
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" loading={mutation.isPending}>
            <Save aria-hidden="true" className="h-4 w-4" />
            Salvar categoria
          </Button>
        </div>
      </form>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Categoria",
            cell: (category) => <strong>{category.name}</strong>
          },
          { key: "price", header: "Senha", cell: (category) => `R$ ${category.ticketPrice}` },
          {
            key: "prize",
            header: "Premiação",
            cell: (category) => (category.prizeAmount ? `R$ ${category.prizeAmount}` : "-")
          },
          {
            key: "days",
            header: "Dias",
            cell: (category) =>
              category.usesDays ? <Badge variant="info">usa dias</Badge> : <Badge>direto</Badge>
          },
          { key: "maps", header: "Mapas", cell: (category) => category.counts.ticketMaps },
          {
            key: "status",
            header: "Status",
            cell: (category) => (
              <Badge variant={category.status === "ACTIVE" ? "accent" : "muted"}>
                {category.status}
              </Badge>
            )
          },
          {
            key: "actions",
            header: "Ações",
            cell: (category) => (
              <Button
                size="sm"
                variant="outline"
                loading={toggleStatus.isPending}
                onClick={() => toggleStatus.mutate(category)}
              >
                {category.status === "ACTIVE" ? "Inativar" : "Ativar"}
              </Button>
            )
          }
        ]}
        data={data?.categories ?? []}
        emptyMessage={isLoading ? "Carregando categorias..." : "Nenhuma categoria cadastrada."}
      />
    </div>
  );
}

function setFormValue<T extends Record<string, string>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  value: string
) {
  setForm((current) => ({ ...current, [field]: value }));
}
