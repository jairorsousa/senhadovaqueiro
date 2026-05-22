"use client";

import { useMemo, useState } from "react";
import { Ban, Grid2X2Plus, RotateCcw } from "lucide-react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Input, NumberMap, Select, type NumberMapItem } from "@senha-do-vaqueiro/ui";
import {
  blockTicketNumber,
  createTicketMap,
  getTicketMapNumbers,
  listCategories,
  listDays,
  listTicketMaps,
  unblockTicketNumber,
  type AdminTicketNumber
} from "../../../../../lib/admin-event-setup";

const initialForm = {
  categoryId: "",
  eventDayId: "",
  name: "",
  firstNumber: "1",
  lastNumber: "50"
};

export function TicketMapManager({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [selectedMapId, setSelectedMapId] = useState<string>("");
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", eventId],
    queryFn: () => listCategories(eventId)
  });
  const daysQuery = useQuery({
    queryKey: ["admin-days", eventId],
    queryFn: () => listDays(eventId)
  });
  const categories = categoriesQuery.data?.categories ?? [];
  const selectedCategory = categories.find((category) => category.id === form.categoryId);
  const mapsQueries = useQueries({
    queries: categories.map((category) => ({
      queryKey: ["admin-ticket-maps", category.id],
      queryFn: () => listTicketMaps(category.id),
      enabled: Boolean(category.id)
    }))
  });
  const maps = mapsQueries.flatMap((query) => query.data?.ticketMaps ?? []);
  const numbersQuery = useQuery({
    queryKey: ["admin-ticket-map-numbers", selectedMapId],
    queryFn: () => getTicketMapNumbers(selectedMapId),
    enabled: Boolean(selectedMapId)
  });
  const createMutation = useMutation({
    mutationFn: () =>
      createTicketMap(form.categoryId, {
        name: form.name,
        firstNumber: Number(form.firstNumber),
        lastNumber: Number(form.lastNumber),
        ...(form.eventDayId ? { eventDayId: form.eventDayId } : {})
      }),
    onSuccess: async (map) => {
      setSelectedMapId(map.id);
      setForm((current) => ({ ...current, name: "", firstNumber: "1", lastNumber: "50" }));
      await queryClient.invalidateQueries({ queryKey: ["admin-ticket-maps", map.categoryId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] });
    }
  });
  const blockMutation = useMutation({
    mutationFn: (ticketNumber: AdminTicketNumber) =>
      ticketNumber.status === "BLOCKED"
        ? unblockTicketNumber(ticketNumber.id)
        : blockTicketNumber(ticketNumber.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-ticket-map-numbers", selectedMapId]
      });
    }
  });

  const numberItems = useMemo<NumberMapItem[]>(
    () =>
      (numbersQuery.data?.numbers ?? []).map((ticketNumber) => ({
        number: ticketNumber.number,
        status: toUiStatus(ticketNumber.status)
      })),
    [numbersQuery.data?.numbers]
  );

  function submit() {
    createMutation.mutate();
  }

  function toggleNumber(number: number) {
    const ticketNumber = numbersQuery.data?.numbers.find((item) => item.number === number);
    if (!ticketNumber || !["AVAILABLE", "BLOCKED"].includes(ticketNumber.status)) return;
    blockMutation.mutate(ticketNumber);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Senhas disponíveis para venda</p>
        <h2 className="text-2xl">Mapa de senhas</h2>
      </div>

      <form
        className="grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Select
          label="Categoria"
          value={form.categoryId}
          onChange={(event) => setFormValue(setForm, "categoryId", event.target.value)}
          required
        >
          <option value="">Escolha uma categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          label="Dia"
          value={form.eventDayId}
          onChange={(event) => setFormValue(setForm, "eventDayId", event.target.value)}
          disabled={!selectedCategory?.usesDays}
          required={selectedCategory?.usesDays}
        >
          <option value="">{selectedCategory?.usesDays ? "Escolha um dia" : "Mapa direto"}</option>
          {daysQuery.data?.days.map((day) => (
            <option key={day.id} value={day.id}>
              {day.name}
            </option>
          ))}
        </Select>
        <Input
          label="Nome do mapa"
          value={form.name}
          onChange={(event) => setFormValue(setForm, "name", event.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Primeiro número"
            type="number"
            min={1}
            value={form.firstNumber}
            onChange={(event) => setFormValue(setForm, "firstNumber", event.target.value)}
            required
          />
          <Input
            label="Último número"
            type="number"
            min={1}
            value={form.lastNumber}
            onChange={(event) => setFormValue(setForm, "lastNumber", event.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2 md:flex md:justify-end">
          <Button type="submit" loading={createMutation.isPending} disabled={!form.categoryId}>
            <Grid2X2Plus aria-hidden="true" className="h-4 w-4" />
            Criar mapa
          </Button>
        </div>
      </form>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-lg font-bold">Mapas</h3>
          <div className="grid gap-2">
            {maps.map((map) => (
              <button
                key={map.id}
                type="button"
                onClick={() => setSelectedMapId(map.id)}
                className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <strong>{map.name}</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {map.category.name} · {map.eventDay?.name ?? "direto"} ·{" "}
                  {map.counts.ticketNumbers} senhas
                </span>
              </button>
            ))}
            {maps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum mapa criado.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-bold">
                {numbersQuery.data?.map.name ?? "Selecione um mapa"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique em uma senha disponível para bloquear ou desbloquear.
              </p>
            </div>
            <Legend />
          </div>
          {numberItems.length > 0 ? (
            <NumberMap numbers={numberItems} allowBlockedSelection onSelect={toggleNumber} />
          ) : (
            <div className="grid min-h-44 place-items-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
              Sem mapa selecionado.
            </div>
          )}
          {blockMutation.isPending ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <RotateCcw aria-hidden="true" className="h-4 w-4 animate-spin" />
              Atualizando senha...
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="accent">disponível</Badge>
      <Badge variant="warning">reservada</Badge>
      <Badge variant="muted">vendida</Badge>
      <Badge variant="danger">
        <Ban aria-hidden="true" className="mr-1 h-3 w-3" />
        bloqueada
      </Badge>
    </div>
  );
}

function toUiStatus(status: AdminTicketNumber["status"]): NumberMapItem["status"] {
  if (status === "AVAILABLE") return "available";
  if (status === "BLOCKED") return "blocked";
  if (["PAID", "CANCELLED"].includes(status)) return "sold";
  return "reserved";
}

function setFormValue<T extends Record<string, string>>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T,
  value: string
) {
  setForm((current) => ({ ...current, [field]: value }));
}
