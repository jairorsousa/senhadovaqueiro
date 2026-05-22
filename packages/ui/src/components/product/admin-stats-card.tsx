import type { LucideIcon } from "lucide-react";
import { Card } from "../base/card";

export function AdminStatsCard({
  label,
  value,
  description,
  icon: Icon
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <strong className="mt-2 block text-2xl font-bold text-foreground">{value}</strong>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/12 text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
