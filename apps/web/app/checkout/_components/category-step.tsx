import { Button, Card, CardContent, CategoryBadge } from "@senha-do-vaqueiro/ui";
import { formatCurrency, type PublicCategory } from "../../../lib/public-events";

export function CategoryStep({
  categories,
  selectedCategoryId,
  onSelect
}: {
  categories: PublicCategory[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {categories.map((category) => (
        <Card
          key={category.id}
          className={
            selectedCategoryId === category.id ? "border-primary shadow-primary" : undefined
          }
        >
          <CardContent className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CategoryBadge name={category.name} />
                <h3 className="mt-3 text-xl">{category.name}</h3>
              </div>
              <strong>{formatCurrency(category.ticketPrice)}</strong>
            </div>
            <p className="text-sm text-muted-foreground">
              {category.usesDays
                ? "Escolha o dia antes do mapa."
                : "Mapa direto sem escolha de dia."}
            </p>
            <Button type="button" className="w-full" onClick={() => onSelect(category.id)}>
              Escolher categoria
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
