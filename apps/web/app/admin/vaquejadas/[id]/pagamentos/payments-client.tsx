"use client";

import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Input, Select, StatusBadge } from "@senha-do-vaqueiro/ui";
import { listCategories, listDays } from "../../../../../lib/admin-event-setup";
import {
  listOrganizerPayments,
  type OrganizerPayment,
  type OrganizerPaymentStatus
} from "../../../../../lib/admin-organizer";
import { formatCurrency } from "../../../../../lib/public-events";

const paymentStatuses: OrganizerPaymentStatus[] = [
  "WAITING_PAYMENT",
  "PAID",
  "EXPIRED",
  "CANCELLED",
  "FAILED"
];

export function OrganizerPaymentsClient({ eventId }: { eventId: string }) {
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    eventDayId: "",
    cpf: ""
  });
  const queryKey = useMemo(() => ["organizer-payments", eventId, filters], [eventId, filters]);
  const paymentsQuery = useQuery({
    queryKey,
    queryFn: () => listOrganizerPayments(eventId, filters)
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", eventId],
    queryFn: () => listCategories(eventId)
  });
  const daysQuery = useQuery({
    queryKey: ["admin-days", eventId],
    queryFn: () => listDays(eventId)
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">Todos</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Select
            label="Categoria"
            value={filters.categoryId}
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
            value={filters.eventDayId}
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
            label="CPF"
            value={filters.cpf}
            onChange={(event) => setFilters({ ...filters, cpf: event.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Vaqueiro</th>
                <th className="px-4 py-3">CPF</th>
                <th className="px-4 py-3">Senhas</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.data?.payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </tbody>
          </table>
          {paymentsQuery.isLoading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <CreditCard aria-hidden="true" className="h-4 w-4" />
              Carregando pagamentos...
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentRow({ payment }: { payment: OrganizerPayment }) {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3 font-mono text-xs">{payment.orderId.slice(0, 8)}</td>
      <td className="px-4 py-3">{payment.cowboy?.name ?? "-"}</td>
      <td className="px-4 py-3">{payment.cowboy?.cpf ?? "-"}</td>
      <td className="px-4 py-3">
        {payment.tickets.map((ticket) => `#${ticket.number}`).join(", ")}
      </td>
      <td className="px-4 py-3">{payment.category?.name ?? "-"}</td>
      <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
      <td className="px-4 py-3">
        <StatusBadge status={toPaymentBadge(payment.status)} />
      </td>
      <td className="px-4 py-3">
        {new Intl.DateTimeFormat("pt-BR").format(new Date(payment.createdAt))}
      </td>
    </tr>
  );
}

function toPaymentBadge(status: OrganizerPaymentStatus) {
  if (status === "PAID") return "paga";
  if (status === "WAITING_PAYMENT") return "pendente";
  if (status === "EXPIRED") return "encerrada";
  return "recusada";
}
