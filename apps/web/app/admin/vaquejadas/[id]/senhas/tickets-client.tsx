"use client";

import { useMemo, useState } from "react";
import { Pencil, Printer, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardContent, Input, Select, StatusBadge } from "@senha-do-vaqueiro/ui";
import { listCategories, listDays } from "../../../../../lib/admin-event-setup";
import {
  getOrganizerTicketPrint,
  listOrganizerTickets,
  type OrganizerTicket,
  type OrganizerTicketFilters,
  updateOrganizerTicket
} from "../../../../../lib/admin-organizer";

const ticketStatuses = ["AVAILABLE", "RESERVED", "PENDING_PAYMENT", "PAID", "CANCELLED", "BLOCKED"];
const paymentStatuses = ["WAITING_PAYMENT", "PAID", "EXPIRED", "CANCELLED", "FAILED"];

export function OrganizerTicketsClient({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<OrganizerTicketFilters>({});
  const [editing, setEditing] = useState<OrganizerTicket | null>(null);
  const queryKey = useMemo(() => ["organizer-tickets", eventId, filters], [eventId, filters]);
  const ticketsQuery = useQuery({
    queryKey,
    queryFn: () => listOrganizerTickets(eventId, filters)
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", eventId],
    queryFn: () => listCategories(eventId)
  });
  const daysQuery = useQuery({
    queryKey: ["admin-days", eventId],
    queryFn: () => listDays(eventId)
  });
  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateOrganizerTicket>[1]) =>
      editing
        ? updateOrganizerTicket(editing.id, payload)
        : Promise.reject(new Error("Sem senha.")),
    onSuccess: async () => {
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: ["organizer-dashboard", eventId] });
    }
  });
  const printMutation = useMutation({
    mutationFn: (ticketId: string) => getOrganizerTicketPrint(ticketId),
    onSuccess: () => window.print()
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-7">
          <Select
            label="Categoria"
            value={filters.categoryId ?? ""}
            onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}
          >
            <option value="">Todas</option>
            {categoriesQuery.data?.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            label="Dia"
            value={filters.eventDayId ?? ""}
            onChange={(event) => setFilters({ ...filters, eventDayId: event.target.value })}
          >
            <option value="">Todos</option>
            {daysQuery.data?.days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.name}
              </option>
            ))}
          </Select>
          <Input
            label="Numero"
            inputMode="numeric"
            value={filters.number ?? ""}
            onChange={(event) => setFilters({ ...filters, number: event.target.value })}
          />
          <Input
            label="Nome"
            value={filters.name ?? ""}
            onChange={(event) => setFilters({ ...filters, name: event.target.value })}
          />
          <Input
            label="CPF"
            value={filters.cpf ?? ""}
            onChange={(event) => setFilters({ ...filters, cpf: event.target.value })}
          />
          <Select
            label="Senha"
            value={filters.ticketStatus ?? ""}
            onChange={(event) => setFilters({ ...filters, ticketStatus: event.target.value })}
          >
            <option value="">Todas</option>
            {ticketStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Select
            label="Pagamento"
            value={filters.paymentStatus ?? ""}
            onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value })}
          >
            <option value="">Todos</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Numero</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Dia</th>
                <th className="px-4 py-3">Vaqueiro</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ticketsQuery.data?.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border">
                  <td className="px-4 py-3 font-semibold">#{ticket.number}</td>
                  <td className="px-4 py-3">{ticket.category.name}</td>
                  <td className="px-4 py-3">{ticket.day?.name ?? "Unico"}</td>
                  <td className="px-4 py-3">{ticket.cowboy?.name ?? "-"}</td>
                  <td className="px-4 py-3">{ticket.cowboy?.cpf ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={toTicketBadge(ticket.status)} />
                  </td>
                  <td className="px-4 py-3">{ticket.payment?.status ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setEditing(ticket)}
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => printMutation.mutate(ticket.id)}
                      >
                        <Printer aria-hidden="true" className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ticketsQuery.isLoading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Search aria-hidden="true" className="h-4 w-4" />
              Carregando senhas...
            </div>
          ) : null}
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            <Input
              label="Nome"
              defaultValue={editing.cowboy?.name ?? ""}
              onChange={(event) =>
                editing.cowboy ? (editing.cowboy.name = event.target.value) : null
              }
            />
            <Input
              label="WhatsApp"
              defaultValue={editing.cowboy?.whatsapp ?? ""}
              onChange={(event) =>
                editing.cowboy ? (editing.cowboy.whatsapp = event.target.value) : null
              }
            />
            <Select
              label="Status"
              defaultValue={editing.status}
              onChange={(event) =>
                setEditing({ ...editing, status: event.target.value as OrganizerTicket["status"] })
              }
            >
              {ticketStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <div className="flex items-end gap-2">
              <Button
                type="button"
                loading={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    ...(editing.cowboy?.name ? { cowboyName: editing.cowboy.name } : {}),
                    ...(editing.cowboy?.whatsapp
                      ? { cowboyWhatsapp: editing.cowboy.whatsapp }
                      : {}),
                    status: editing.status
                  })
                }
              >
                Salvar
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function toTicketBadge(status: OrganizerTicket["status"]) {
  if (status === "AVAILABLE") return "disponível";
  if (status === "PAID") return "paga";
  if (status === "PENDING_PAYMENT") return "pendente";
  if (status === "CANCELLED") return "cancelada";
  if (status === "BLOCKED") return "recusada";
  return "reservada";
}
