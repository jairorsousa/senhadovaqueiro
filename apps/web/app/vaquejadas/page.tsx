import { PublicShell } from "../../components/public-shell";
import { PublicEventsBrowser } from "./_components/public-events-browser";

export default function VaquejadasPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Vaquejadas abertas para compra</p>
          <h1 className="text-3xl md:text-4xl">Encontre sua próxima senha</h1>
        </div>
        <PublicEventsBrowser />
      </section>
    </PublicShell>
  );
}
