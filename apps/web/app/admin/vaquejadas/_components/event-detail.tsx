"use client";

import Link from "next/link";
import { Archive, CheckCircle, Edit, ExternalLink, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge
} from "@senha-do-vaqueiro/ui";
import {
  archiveAdminEvent,
  type ApiError,
  getAdminEvent,
  publishAdminEvent,
  statusLabel
} from "../../../../lib/admin-events";

export function EventDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const {
    data: event,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => getAdminEvent(id)
  });
  const publishMutation = useMutation({
    mutationFn: () => publishAdminEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
    }
  });
  const archiveMutation = useMutation({
    mutationFn: () => archiveAdminEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
    }
  });

  if (isLoading) {
    return (
      <div className="grid min-h-72 place-items-center rounded-lg border border-border bg-card">
        <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
        Nao foi possivel carregar a vaquejada.
      </div>
    );
  }

  const publishError = publishMutation.error as ApiError | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="space-y-2">
          <StatusBadge status={statusLabel(event.status)} />
          <h2 className="text-3xl">{event.name}</h2>
          <p className="text-sm text-muted-foreground">
            {event.location} · {event.city}/{event.state} · {formatFullDate(event.startsAt)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/admin/vaquejadas/${event.id}/editar`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Edit aria-hidden="true" className="h-4 w-4" />
            Editar
          </Link>
          <Button
            type="button"
            loading={publishMutation.isPending}
            disabled={event.status === "ACTIVE"}
            onClick={() => publishMutation.mutate()}
          >
            <CheckCircle aria-hidden="true" className="h-4 w-4" />
            Publicar
          </Button>
          <Button
            type="button"
            variant="outline"
            loading={archiveMutation.isPending}
            disabled={event.status === "CLOSED"}
            onClick={() => archiveMutation.mutate()}
          >
            <Archive aria-hidden="true" className="h-4 w-4" />
            Encerrar
          </Button>
        </div>
      </div>

      {publishError ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
          <p>{publishError.error.message}</p>
          {publishError.error.details?.length ? (
            <ul className="mt-2 list-disc pl-5">
              {publishError.error.details.map((detail) => (
                <li key={`${detail.field}-${detail.message}`}>{detail.message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Informações principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Slug" value={event.slug} />
            <InfoRow
              label="Período"
              value={`${formatFullDate(event.startsAt)} a ${formatFullDate(event.endsAt)}`}
            />
            <InfoRow label="Descrição" value={event.description ?? "Sem descrição"} />
            <InfoRow label="Regulamento" value={event.rules ?? "Sem regulamento"} />
            {event.bannerUrl ? (
              <a
                href={event.bannerUrl}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Abrir banner
              </a>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChecklistItem
              checked={event.publicationChecklist.hasMainInfo}
              label="Informações principais"
            />
            <ChecklistItem
              checked={event.publicationChecklist.hasValidDates}
              label="Datas válidas"
            />
            <ChecklistItem
              checked={event.publicationChecklist.hasActiveCategory}
              label="Categoria ativa"
            />
            <ChecklistItem
              checked={event.publicationChecklist.hasTicketMap}
              label="Mapa de senhas"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Badge variant="info">{event.counts.eventDays} datas</Badge>
              <Badge variant="accent">{event.counts.categories} categorias</Badge>
              <Badge variant="secondary">{event.counts.ticketMaps} mapas</Badge>
              <Badge variant="muted">{event.counts.orders} pedidos</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-6">{value}</p>
    </div>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span>{label}</span>
      <Badge variant={checked ? "accent" : "warning"}>{checked ? "ok" : "pendente"}</Badge>
    </div>
  );
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
