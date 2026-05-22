"use client";

import { Button, NumberMap, Skeleton, type NumberMapItem } from "@senha-do-vaqueiro/ui";
import type { PublicTicketNumber } from "../../../lib/public-events";

export function TicketSelectionStep({
  numbers,
  selectedIds,
  isLoading,
  onToggle,
  onReserve,
  loading
}: {
  numbers: PublicTicketNumber[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (ticket: PublicTicketNumber) => void;
  onReserve: () => void;
  loading: boolean;
}) {
  const selectedNumbers = numbers
    .filter((ticket) => selectedIds.includes(ticket.id))
    .map((ticket) => ticket.number);

  if (isLoading) {
    return <Skeleton className="h-56" />;
  }

  return (
    <div className="space-y-4">
      <NumberMap
        numbers={numbers.map(toNumberMapItem)}
        selectedNumbers={selectedNumbers}
        onSelect={(number) => {
          const ticket = numbers.find((item) => item.number === number);
          if (ticket) onToggle(ticket);
        }}
      />
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>Disponível: clique para selecionar.</span>
        <span>Reservada, vendida ou bloqueada: indisponível.</span>
      </div>
      <Button
        type="button"
        loading={loading}
        disabled={selectedIds.length === 0}
        onClick={onReserve}
      >
        Reservar senhas
      </Button>
    </div>
  );
}

function toNumberMapItem(ticket: PublicTicketNumber): NumberMapItem {
  if (ticket.status === "AVAILABLE") return { number: ticket.number, status: "available" };
  if (ticket.status === "BLOCKED") return { number: ticket.number, status: "blocked" };
  if (ticket.status === "SOLD") return { number: ticket.number, status: "sold" };
  return { number: ticket.number, status: "reserved" };
}
