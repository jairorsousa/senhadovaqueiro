"use client";

import { useState } from "react";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PaymentStatus,
  StatusBadge
} from "@senha-do-vaqueiro/ui";
import { getMyTicket, getMyTicketPrint, updateMyTicket } from "../../../lib/my-tickets";
import { formatCurrency } from "../../../lib/public-events";
import { CowboyLoginForm } from "./cowboy-login-form";

export function MyTicketDetailClient({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const ticketQuery = useQuery({
    queryKey: ["my-ticket", ticketId],
    queryFn: () => getMyTicket(ticketId),
    retry: false
  });
  const updateMutation = useMutation({
    mutationFn: () => updateMyTicket(ticketId, { name, whatsapp }),
    onSuccess: async (ticket) => {
      setMessage("Dados atualizados.");
      setName(ticket.cowboy.name);
      setWhatsapp(ticket.cowboy.whatsapp);
      await queryClient.invalidateQueries({ queryKey: ["my-ticket", ticketId] });
      await queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
    }
  });
  const printMutation = useMutation({
    mutationFn: () => getMyTicketPrint(ticketId),
    onSuccess: () => {
      window.print();
    }
  });

  if (ticketQuery.error) {
    return (
      <CowboyLoginForm
        onSuccess={() => {
          void ticketQuery.refetch();
        }}
      />
    );
  }

  const ticket = ticketQuery.data;

  return (
    <div className="space-y-4">
      <a
        href="/minhas-senhas"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Voltar
      </a>

      {ticketQuery.isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Carregando senha...
          </CardContent>
        </Card>
      ) : null}

      {ticket ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>Senha {ticket.number}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ticket.event.name} · {ticket.category.name}
                  </p>
                </div>
                <StatusBadge status={ticket.status === "PAID" ? "paga" : "pendente"} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Vaqueiro:</span> {ticket.cowboy.name}
                </p>
                <p>
                  <span className="text-muted-foreground">CPF:</span> {ticket.cowboy.cpf}
                </p>
                <p>
                  <span className="text-muted-foreground">Dia:</span> {ticket.day?.name ?? "Unico"}
                </p>
                <p>
                  <span className="text-muted-foreground">Valor:</span>{" "}
                  {formatCurrency(ticket.unitPrice)}
                </p>
                <p>
                  <span className="text-muted-foreground">Pedido:</span> {ticket.order.status}
                </p>
                <p>
                  <span className="text-muted-foreground">Pagamento:</span>{" "}
                  {ticket.payment?.status ?? "Nao gerado"}
                </p>
              </div>
              <PaymentStatus status={ticket.paymentStatus} />
              {ticket.payment?.pixCopyPaste && ticket.paymentStatus === "waiting" ? (
                <div className="rounded-md border border-border bg-background p-3 text-xs break-all">
                  {ticket.payment.pixCopyPaste}
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => printMutation.mutate()}
                disabled={printMutation.isPending}
              >
                <Printer aria-hidden="true" className="h-4 w-4" />
                Imprimir senha
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados do vaqueiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {message ? <p className="text-sm font-medium text-success">{message}</p> : null}
              {!ticket.canEdit ? (
                <p className="text-sm text-muted-foreground">
                  Dados bloqueados para edicao depois da confirmacao do pagamento.
                </p>
              ) : null}
              <form
                className="grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateMutation.mutate();
                }}
              >
                <Input
                  label="Nome"
                  value={name || ticket.cowboy.name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!ticket.canEdit}
                />
                <Input
                  label="WhatsApp"
                  value={whatsapp || ticket.cowboy.whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  disabled={!ticket.canEdit}
                />
                <Button type="submit" disabled={!ticket.canEdit || updateMutation.isPending}>
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  Salvar dados
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
