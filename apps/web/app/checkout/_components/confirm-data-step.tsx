import { Button, Card, CardContent } from "@senha-do-vaqueiro/ui";
import type { CheckoutOrder } from "../../../lib/checkout";
import { formatCurrency } from "../../../lib/public-events";

export function ConfirmDataStep({
  order,
  onConfirm
}: {
  order: CheckoutOrder;
  onConfirm: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-sm text-muted-foreground">Vaqueiro</p>
          <h3 className="text-xl">{order.cowboy?.name}</h3>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <strong>Senha {item.number}</strong>
              <p className="text-muted-foreground">
                {item.category.name} · {formatCurrency(item.unitPrice)}
              </p>
            </div>
          ))}
        </div>
        <Button type="button" onClick={onConfirm}>
          Gerar Pix
        </Button>
      </CardContent>
    </Card>
  );
}
