"use client";

import { cn } from "../../lib/cn";

export type TicketNumberStatus = "available" | "reserved" | "sold" | "blocked";

const statusLabel: Record<TicketNumberStatus, string> = {
  available: "Disponível",
  reserved: "Reservada",
  sold: "Vendida",
  blocked: "Bloqueada"
};

const statusClass: Record<TicketNumberStatus, string> = {
  available: "border-success/45 bg-success/12 text-success hover:scale-[1.04]",
  reserved: "border-reserved/45 bg-reserved/12 text-reserved",
  sold: "ticket-unavailable border-sold/40 bg-sold/12 text-muted-foreground",
  blocked: "ticket-unavailable border-danger/40 bg-danger/12 text-danger"
};

export function TicketNumber({
  number,
  status,
  selected = false,
  allowBlockedSelection = false,
  onSelect
}: {
  number: number;
  status: TicketNumberStatus;
  selected?: boolean;
  allowBlockedSelection?: boolean;
  onSelect?: (number: number) => void;
}) {
  const disabled = status !== "available" && !(allowBlockedSelection && status === "blocked");

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Senha ${number}: ${statusLabel[status]}`}
      aria-pressed={selected}
      onClick={() => onSelect?.(number)}
      className={cn(
        "h-11 w-11 rounded-md border text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        statusClass[status],
        selected && "ticket-selected border-transparent"
      )}
    >
      {number}
    </button>
  );
}
