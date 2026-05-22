"use client";

import { Download, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge
} from "@senha-do-vaqueiro/ui";
import {
  getReportsPayments,
  getReportsSummary,
  getReportsTickets,
  reportsCsvUrl
} from "../../../../../lib/admin-reports";
import { formatCurrency } from "../../../../../lib/public-events";

export function ReportsClient({ eventId }: { eventId: string }) {
  const summaryQuery = useQuery({
    queryKey: ["reports-summary", eventId],
    queryFn: () => getReportsSummary(eventId)
  });
  const ticketsQuery = useQuery({
    queryKey: ["reports-tickets", eventId],
    queryFn: () => getReportsTickets(eventId)
  });
  const paymentsQuery = useQuery({
    queryKey: ["reports-payments", eventId],
    queryFn: () => getReportsPayments(eventId)
  });

  const summary = summaryQuery.data;
  const hasReportError = summaryQuery.isError || ticketsQuery.isError || paymentsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.open(reportsCsvUrl(eventId), "_blank")}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {summaryQuery.isLoading ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Carregando relatórios...
          </CardContent>
        </Card>
      ) : null}

      {hasReportError ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">
            Nao foi possivel carregar os relatorios. Verifique sua sessao e tente novamente.
          </CardContent>
        </Card>
      ) : null}

      {summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric label="Senhas" value={summary.totals.tickets} />
            <Metric label="Vendidas" value={summary.totals.ticketsSold} />
            <Metric
              label="Receita confirmada"
              value={formatCurrency(summary.totals.revenueConfirmed)}
            />
            <Metric
              label="Receita pendente"
              value={formatCurrency(summary.totals.revenuePending)}
            />
            <Metric label="Receita total" value={formatCurrency(summary.totals.revenueTotal)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportTable
              title="Por categoria"
              rows={summary.byCategory.map((item) => [
                item.categoryName,
                item.ticketsSold.toString(),
                formatCurrency(item.revenueConfirmed),
                formatCurrency(item.revenuePending)
              ])}
              headers={["Categoria", "Vendidas", "Confirmada", "Pendente"]}
            />
            <ReportTable
              title="Por dia"
              rows={summary.byDay.map((item) => [
                item.dayName,
                item.ticketsSold.toString(),
                formatCurrency(item.revenueConfirmed),
                formatCurrency(item.revenuePending)
              ])}
              headers={["Dia", "Vendidas", "Confirmada", "Pendente"]}
            />
          </div>

          <ReportTable
            title="Por status de pagamento"
            rows={summary.byPaymentStatus.map((item) => [
              item.status,
              item.count.toString(),
              formatCurrency(item.amount)
            ])}
            headers={["Status", "Pagamentos", "Valor"]}
          />
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Senhas vendidas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Senha</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Dia</th>
                <th className="px-4 py-3">Vaqueiro</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {ticketsQuery.data?.tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border">
                  <td className="px-4 py-3 font-semibold">#{ticket.number}</td>
                  <td className="px-4 py-3">{ticket.category.name}</td>
                  <td className="px-4 py-3">{ticket.day?.name ?? "Unico"}</td>
                  <td className="px-4 py-3">{ticket.cowboy?.name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={ticket.payment?.status === "PAID" ? "paga" : "pendente"} />
                  </td>
                  <td className="px-4 py-3">{formatCurrency(ticket.payment?.amount ?? "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ticketsQuery.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Carregando senhas vendidas...</p>
          ) : null}
          {!ticketsQuery.isLoading && ticketsQuery.data?.tickets.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhuma senha vendida encontrada.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando pagamentos...</p>
          ) : null}
          {!paymentsQuery.isLoading && paymentsQuery.data?.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pagamento encontrado.</p>
          ) : null}
          {paymentsQuery.data?.payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <FileText aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                <span>{payment.cowboy?.name ?? "Sem vaqueiro"}</span>
              </div>
              <span>{payment.tickets.map((ticket) => `#${ticket.number}`).join(", ")}</span>
              <StatusBadge status={payment.status === "PAID" ? "paga" : "pendente"} />
              <strong>{formatCurrency(payment.amount)}</strong>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <strong className="mt-1 block text-2xl">{value}</strong>
      </CardContent>
    </Card>
  );
}

function ReportTable({
  title,
  headers,
  rows
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")} className="border-b border-border">
                {row.map((cell, index) => (
                  <td key={`${cell}-${index}`} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
