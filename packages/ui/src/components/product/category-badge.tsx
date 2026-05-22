import { Badge } from "../base/badge";

const categoryVariant: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  profissional: "primary",
  amador: "secondary",
  aspirante: "outline",
  feminino: "accent",
  kids: "info",
  infantil: "info",
  aberta: "warning"
};

export function CategoryBadge({ name }: { name: string }) {
  return <Badge variant={categoryVariant[name.toLowerCase()] ?? "outline"}>{name}</Badge>;
}
