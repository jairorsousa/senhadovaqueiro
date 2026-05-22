import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";

const payment = {
  waiting: {
    icon: Clock,
    className: "border-warning/30 bg-warning/12 text-warning",
    message: "Estamos aguardando a confirmação do pagamento."
  },
  paid: {
    icon: CheckCircle,
    className: "border-success/30 bg-success/12 text-success",
    message: "Pagamento confirmado. Sua senha está garantida."
  },
  expired: {
    icon: XCircle,
    className: "border-muted bg-muted text-muted-foreground",
    message: "O tempo para pagamento expirou. Escolha uma nova senha."
  },
  refused: {
    icon: AlertTriangle,
    className: "border-danger/30 bg-danger/12 text-danger",
    message: "Não conseguimos confirmar o pagamento. Tente novamente."
  }
} as const;

export function PaymentStatus({ status }: { status: keyof typeof payment }) {
  const item = payment[status];
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border p-3 text-sm font-medium",
        item.className
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{item.message}</p>
    </div>
  );
}
