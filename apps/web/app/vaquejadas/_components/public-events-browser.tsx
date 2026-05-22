"use client";

import { Search, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, CategoryBadge, EventCard, Input, Skeleton } from "@senha-do-vaqueiro/ui";
import { formatEventPeriod, listPublicEvents, type PublicEvent } from "../../../lib/public-events";

export function PublicEventsBrowser({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-events", query],
    queryFn: () => listPublicEvents(query),
    staleTime: 20_000
  });
  const events = data?.events ?? [];
  const featured = useMemo(() => events.slice(0, compact ? 3 : events.length), [compact, events]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          aria-label="Buscar vaquejada"
          {...(!compact ? { label: "Buscar vaquejada" } : {})}
          placeholder="Nome, cidade ou estado"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="button" className="md:self-end">
          <Search aria-hidden="true" className="h-4 w-4" />
          Buscar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          Nao foi possivel carregar as vaquejadas agora.
        </div>
      ) : null}

      {!isLoading && featured.length === 0 ? (
        <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-border bg-card px-4 text-center text-sm text-muted-foreground">
          Nenhuma vaquejada ativa encontrada.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((event) => (
          <EventCard
            key={event.id}
            name={event.name}
            city={event.city}
            state={event.state}
            date={formatEventPeriod(event)}
            status="ativa"
            categories={event.categories.map((category) => category.name)}
            actionHref={`/vaquejadas/${event.slug}`}
          />
        ))}
      </div>

      {compact && events.length > featured.length ? (
        <a
          href="/vaquejadas"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
        >
          <Ticket aria-hidden="true" className="h-4 w-4" />
          Ver todas as vaquejadas
        </a>
      ) : null}
    </div>
  );
}

export function CategoryStrip({ event }: { event: PublicEvent }) {
  return (
    <div className="flex flex-wrap gap-2">
      {event.categories.map((category) => (
        <CategoryBadge key={category.id} name={category.name} />
      ))}
    </div>
  );
}
