import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "../base/badge";

const config = {
  rascunho: { variant: "info", icon: Clock },
  ativa: { variant: "accent", icon: CheckCircle },
  encerrada: { variant: "muted", icon: Clock },
  cancelada: { variant: "danger", icon: XCircle },
  disponível: { variant: "accent", icon: CheckCircle },
  reservada: { variant: "warning", icon: Clock },
  vendida: { variant: "muted", icon: XCircle },
  pendente: { variant: "warning", icon: Clock },
  paga: { variant: "accent", icon: CheckCircle },
  recusada: { variant: "danger", icon: AlertTriangle }
} as const;

export type StatusBadgeStatus = keyof typeof config;

export function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  const item = config[status];
  const Icon = item.icon;

  return (
    <Badge variant={item.variant}>
      <Icon aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
      {status}
    </Badge>
  );
}
