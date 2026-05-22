import { CalendarDays, Menu, Ticket } from "lucide-react";
import { Button } from "@senha-do-vaqueiro/ui";

export function PublicShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <a href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/15 text-primary">
              <Ticket aria-hidden="true" className="h-5 w-5" />
            </span>
            Senha do Vaqueiro
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="/vaquejadas">
              Vaquejadas
            </a>
            <a className="hover:text-foreground" href="/minhas-senhas">
              Minhas senhas
            </a>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
            <Menu aria-hidden="true" className="h-5 w-5" />
          </Button>
          <a
            href="/vaquejadas"
            className="hidden min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary transition hover:brightness-110 md:inline-flex"
          >
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            Ver vaquejadas
          </a>
        </div>
      </header>
      {children}
    </main>
  );
}
