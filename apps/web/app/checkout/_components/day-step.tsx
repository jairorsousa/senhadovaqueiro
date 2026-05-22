import { Button, Card, CardContent } from "@senha-do-vaqueiro/ui";
import type { PublicEventDay } from "../../../lib/public-events";

export function DayStep({
  days,
  selectedDayId,
  onSelect
}: {
  days: PublicEventDay[];
  selectedDayId: string;
  onSelect: (dayId: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {days.map((day) => (
        <Card
          key={day.id}
          className={selectedDayId === day.id ? "border-primary shadow-primary" : undefined}
        >
          <CardContent className="space-y-3 p-4">
            <h3 className="text-xl">{day.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(day.startsAt)
              )}
            </p>
            <Button type="button" className="w-full" onClick={() => onSelect(day.id)}>
              Escolher dia
            </Button>
          </CardContent>
        </Card>
      ))}
      {days.length === 0 ? (
        <div className="rounded-md border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
          Nenhum dia disponível para esta categoria.
        </div>
      ) : null}
    </div>
  );
}
