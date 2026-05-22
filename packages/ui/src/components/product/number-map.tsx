"use client";

import { TicketNumber, type TicketNumberStatus } from "./ticket-number";

export type NumberMapItem = {
  number: number;
  status: TicketNumberStatus;
};

export function NumberMap({
  numbers,
  selectedNumber,
  selectedNumbers,
  allowBlockedSelection = false,
  onSelect
}: {
  numbers: NumberMapItem[];
  selectedNumber?: number;
  selectedNumbers?: number[];
  allowBlockedSelection?: boolean;
  onSelect?: (number: number) => void;
}) {
  const selectedSet = new Set(selectedNumbers ?? (selectedNumber ? [selectedNumber] : []));

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {numbers.map((item) => (
        <TicketNumber
          key={item.number}
          number={item.number}
          status={item.status}
          selected={selectedSet.has(item.number)}
          allowBlockedSelection={allowBlockedSelection}
          {...(onSelect ? { onSelect } : {})}
        />
      ))}
    </div>
  );
}
