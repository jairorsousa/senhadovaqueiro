import { Banknote, CreditCard } from "lucide-react";
import { Button } from "../base/button";
import { Card, CardContent, CardHeader, CardTitle } from "../base/card";

export type CheckoutSummaryProps = {
  eventName: string;
  category: string;
  ticketNumber: number;
  day: string;
  total: string;
};

export function CheckoutSummary({
  eventName,
  category,
  ticketNumber,
  day,
  total
}: CheckoutSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo da compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Vaquejada</span>
          <strong className="text-right">{eventName}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Categoria</span>
          <strong>{category}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Senha</span>
          <strong>{ticketNumber}</strong>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Dia</span>
          <strong>{day}</strong>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-base">
          <span className="flex items-center gap-2 font-semibold">
            <Banknote aria-hidden="true" className="h-4 w-4 text-primary" />
            Total
          </span>
          <strong>{total}</strong>
        </div>
        <Button className="w-full">
          <CreditCard aria-hidden="true" className="h-4 w-4" />
          Pagar com Pix
        </Button>
      </CardContent>
    </Card>
  );
}
