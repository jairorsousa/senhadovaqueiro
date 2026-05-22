"use client";

import Link from "next/link";
import { CalendarPlus, Eye, MapPin, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Button, DataTable, Skeleton, StatusBadge } from "@senha-do-vaqueiro/ui";
import { listAdminEvents, statusLabel, type AdminEvent } from "../../../../lib/admin-events";

export function EventsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-events"],
    queryFn: listAdminEvents
  });

  if (isLoading) {
    return (
      <div className="grid gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        Nao foi possivel carregar as vaquejadas. Verifique sua sessao administrativa.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">Eventos cadastrados</p>
          <h2 className="text-2xl">Vaquejadas</h2>
        </div>
        <Link
          href="/admin/vaquejadas/nova"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary transition hover:brightness-110"
        >
          <CalendarPlus aria-hidden="true" className="h-4 w-4" />
          Nova vaquejada
        </Link>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Nome",
            cell: (event) => (
              <div>
                <p className="font-semibold">{event.name}</p>
                <p className="text-xs text-muted-foreground">{event.slug}</p>
              </div>
            )
          },
          {
            key: "place",
            header: "Cidade/UF",
            cell: (event) => (
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-4 w-4 text-primary" />
                {event.city}/{event.state}
              </span>
            )
          },
          { key: "period", header: "Periodo", cell: (event) => formatPeriod(event) },
          {
            key: "status",
            header: "Status",
            cell: (event) => <StatusBadge status={statusLabel(event.status)} />
          },
          {
            key: "setup",
            header: "Configuração",
            cell: (event) => (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={event.publicationChecklist.hasActiveCategory ? "accent" : "warning"}
                >
                  {event.counts.categories} categorias
                </Badge>
                <Badge variant={event.publicationChecklist.hasTicketMap ? "accent" : "warning"}>
                  {event.counts.ticketMaps} mapas
                </Badge>
              </div>
            )
          },
          {
            key: "actions",
            header: "Ações",
            cell: (event) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `/admin/vaquejadas/${event.id}`;
                }}
              >
                <Eye aria-hidden="true" className="h-4 w-4" />
                Abrir
              </Button>
            )
          }
        ]}
        data={data?.events ?? []}
        emptyMessage="Nenhuma vaquejada cadastrada ainda."
      />

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
        <InfoPill
          label="Publicadas"
          value={(data?.events ?? []).filter((event) => event.status === "ACTIVE").length}
        />
        <InfoPill
          label="Rascunhos"
          value={(data?.events ?? []).filter((event) => event.status === "DRAFT").length}
        />
        <InfoPill
          label="Senhas configuradas"
          value={(data?.events ?? []).reduce((total, event) => total + event.counts.ticketMaps, 0)}
          icon={Ticket}
        />
      </div>
    </div>
  );
}

function InfoPill({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon?: typeof Ticket;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-2xl font-bold">
        {Icon ? <Icon aria-hidden="true" className="h-5 w-5 text-primary" /> : null}
        {value}
      </p>
    </div>
  );
}

function formatPeriod(event: AdminEvent) {
  const startsAt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(event.startsAt)
  );
  const endsAt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(event.endsAt)
  );

  return `${startsAt} a ${endsAt}`;
}
