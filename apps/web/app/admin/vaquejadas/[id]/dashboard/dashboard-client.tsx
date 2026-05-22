"use client";

import { Banknote, Clock, Ticket, TicketCheck, TicketX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@senha-do-vaqueiro/ui";
import { getOrganizerDashboard } from "../../../../../lib/admin-organizer";
import { formatCurrency } from "../../../../../lib/public-events";

export function OrganizerDashboardClient({ eventId }: { eventId: string }) {
  const dashboardQuery = useQuery({
    queryKey: ["organizer-dashboard", eventId],
    queryFn: () => getOrganizerDashboard(eventId)
  });

  if (dashboardQuery.isLoading) {
    return <div className="rounded-md border border-border bg-card p-4 text-sm">Carregando...</div>;
  }

  if (!dashboardQuery.data) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Nao foi possivel carregar o dashboard.
      </div>
    );
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Vendidas" value={dashboard.ticketCounts.sold} icon={TicketCheck} />
        <MetricCard label="Disponiveis" value={dashboard.ticketCounts.available} icon={Ticket} />
        <MetricCard label="Reservadas" value={dashboard.ticketCounts.reserved} icon={Clock} />
        <MetricCard label="Pendentes" value={dashboard.ticketCounts.pending} icon={TicketX} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          label="Receita confirmada"
          value={formatCurrency(dashboard.revenue.confirmed)}
          icon={Banknote}
        />
        <MetricCard
          label="Receita pendente"
          value={formatCurrency(dashboard.revenue.pending)}
          icon={Clock}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Vendas por categoria"
          items={dashboard.salesByCategory.map((item) => ({
            label: item.categoryName,
            value: item.sold
          }))}
        />
        <BreakdownCard
          title="Vendas por dia"
          items={dashboard.salesByDay.map((item) => ({
            label: item.dayName,
            value: item.sold
          }))}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <strong className="mt-1 block text-2xl">{value}</strong>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem vendas ainda.</p>
        ) : null}
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
