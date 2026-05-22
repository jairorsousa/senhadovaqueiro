import { Banknote, Clock, Ticket } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@senha-do-vaqueiro/ui";
import {
  formatCurrency,
  type PublicCategory,
  type PublicEvent,
  type PublicEventDay
} from "../../../lib/public-events";
import type { CheckoutOrder } from "../../../lib/checkout";

export function CheckoutSummary({
  event,
  category,
  day,
  selectedNumbers,
  order
}: {
  event: PublicEvent;
  category: PublicCategory | undefined;
  day: PublicEventDay | null;
  selectedNumbers: number[];
  order?: CheckoutOrder | null;
}) {
  const total = order
    ? formatCurrency(order.totalAmount)
    : category
      ? formatCurrency((Number(category.ticketPrice) * selectedNumbers.length).toFixed(2))
      : "R$ 0,00";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <SummaryRow label="Vaquejada" value={event.name} />
        <SummaryRow label="Categoria" value={category?.name ?? "Escolha uma categoria"} />
        <SummaryRow
          label="Dia"
          value={day?.name ?? (category?.usesDays ? "Escolha um dia" : "Mapa direto")}
        />
        <div className="rounded-md border border-border bg-background px-3 py-2">
          <p className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Ticket aria-hidden="true" className="h-4 w-4 text-primary" />
            Senhas
          </p>
          <div className="flex flex-wrap gap-2">
            {(order?.items.map((item) => item.number) ?? selectedNumbers).map((number) => (
              <Badge key={number} variant="accent">
                {number}
              </Badge>
            ))}
            {selectedNumbers.length === 0 && !order ? (
              <span className="text-muted-foreground">Nenhuma senha escolhida</span>
            ) : null}
          </div>
        </div>
        {order?.expiresAt ? (
          <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-warning">
            <Clock aria-hidden="true" className="h-4 w-4" />
            Reserva ate{" "}
            {new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(
              new Date(order.expiresAt)
            )}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-base">
          <span className="flex items-center gap-2 font-semibold">
            <Banknote aria-hidden="true" className="h-4 w-4 text-primary" />
            Total
          </span>
          <strong>{total}</strong>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-right">{value}</strong>
    </div>
  );
}
