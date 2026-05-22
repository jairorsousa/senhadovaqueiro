"use client";

import { Printer, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PaymentStatus,
  StatusBadge
} from "@senha-do-vaqueiro/ui";
import { listMyTickets, type MyTicket } from "../../../lib/my-tickets";
import { formatCurrency } from "../../../lib/public-events";
import { CowboyLoginForm } from "./cowboy-login-form";

export function MyTicketsClient() {
  const queryClient = useQueryClient();
  const ticketsQuery = useQuery({
    queryKey: ["my-tickets"],
    queryFn: listMyTickets,
    retry: false
  });

  if (ticketsQuery.error) {
    return (
      <CowboyLoginForm
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => void ticketsQuery.refetch()}
          disabled={ticketsQuery.isFetching}
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {ticketsQuery.isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Carregando senhas...
          </CardContent>
        </Card>
      ) : null}

      {ticketsQuery.data?.tickets.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Nenhuma senha encontrada para este CPF.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {ticketsQuery.data?.tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: MyTicket }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Senha {ticket.number}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {ticket.event.name} · {ticket.category.name}
            </p>
          </div>
          <StatusBadge status={toBadgeStatus(ticket)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Dia:</span> {ticket.day?.name ?? "Unico"}
          </p>
          <p>
            <span className="text-muted-foreground">Valor:</span> {formatCurrency(ticket.unitPrice)}
          </p>
          <p>
            <span className="text-muted-foreground">Local:</span> {ticket.event.city}/
            {ticket.event.state}
          </p>
          <p>
            <span className="text-muted-foreground">Pedido:</span> {ticket.order.status}
          </p>
        </div>
        <PaymentStatus status={ticket.paymentStatus} />
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={`/minhas-senhas/${ticket.id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Printer aria-hidden="true" className="h-4 w-4" />
            Ver senha
          </a>
          <a
            href={`/vaquejadas/${ticket.event.slug}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/90"
          >
            Ver vaquejada
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function toBadgeStatus(ticket: MyTicket) {
  if (ticket.status === "PAID") return "paga";
  if (ticket.status === "PENDING_PAYMENT" || ticket.status === "RESERVED") return "pendente";
  if (ticket.status === "CANCELLED") return "cancelada";
  return "reservada";
}
