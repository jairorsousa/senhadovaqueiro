import { BarChart3, CalendarDays, CreditCard, Settings, Ticket, Trophy, Users } from "lucide-react";

const nav = [
  { label: "Dashboard", icon: BarChart3, href: "/admin" },
  { label: "Vaquejadas", icon: CalendarDays, href: "/admin/vaquejadas" },
  { label: "Categorias", icon: Trophy, href: "/admin/vaquejadas" },
  { label: "Mapa de senhas", icon: Ticket, href: "/admin/vaquejadas" },
  { label: "Pagamentos", icon: CreditCard, href: "/admin" },
  { label: "Participantes", icon: Users, href: "/admin" },
  { label: "Configurações", icon: Settings, href: "/admin" }
];

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="light min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-card px-4 py-5 lg:block">
        <a href="/admin" className="flex items-center gap-2 font-heading text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/12 text-primary">
            <Ticket aria-hidden="true" className="h-5 w-5" />
          </span>
          Senha do Vaqueiro
        </a>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <item.icon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/92 px-4 py-4 backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Administração</p>
              <h1 className="text-xl font-bold">Painel do organizador</h1>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold">
              Light Mode Arena
            </span>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
