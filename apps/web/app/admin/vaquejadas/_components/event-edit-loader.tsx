"use client";

import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminEvent } from "../../../../lib/admin-events";
import { EventForm } from "./event-form";

export function EventEditLoader({ id }: { id: string }) {
  const {
    data: event,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => getAdminEvent(id)
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

  return <EventForm event={event} />;
}
