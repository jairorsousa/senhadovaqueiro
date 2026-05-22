import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Button } from "../base/button";
import { Card } from "../base/card";
import { CategoryBadge } from "./category-badge";
import { StatusBadge, type StatusBadgeStatus } from "./status-badge";

export type EventCardProps = {
  name: string;
  city: string;
  state: string;
  date: string;
  status: StatusBadgeStatus;
  categories: string[];
  actionHref?: string;
};

export function EventCard({
  name,
  city,
  state,
  date,
  status,
  categories,
  actionHref
}: EventCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="gradient-arena h-24 border-b border-border" aria-hidden="true" />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl leading-tight">{name}</h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {city}/{state}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          {date}
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryBadge key={category} name={category} />
          ))}
        </div>
        {actionHref ? (
          <a
            href={actionHref}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary transition hover:brightness-110"
          >
            <Ticket aria-hidden="true" className="h-4 w-4" />
            Comprar senha
          </a>
        ) : (
          <Button className="w-full">
            <Ticket aria-hidden="true" className="h-4 w-4" />
            Comprar senha
          </Button>
        )}
      </div>
    </Card>
  );
}
