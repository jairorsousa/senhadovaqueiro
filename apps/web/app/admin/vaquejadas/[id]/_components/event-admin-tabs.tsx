import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  ListChecks,
  Map,
  Settings,
  Ticket
} from "lucide-react";

const tabs = [
  { href: "", label: "Resumo", icon: Settings },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/categorias", label: "Categorias", icon: ListChecks },
  { href: "/dias", label: "Dias", icon: CalendarDays },
  { href: "/mapa", label: "Mapa", icon: Map },
  { href: "/senhas", label: "Senhas", icon: Ticket },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/relatorios", label: "Relatórios", icon: FileText }
];

export function EventAdminTabs({ eventId }: { eventId: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <a
          key={tab.label}
          href={`/admin/vaquejadas/${eventId}${tab.href}`}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <tab.icon aria-hidden="true" className="h-4 w-4" />
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
