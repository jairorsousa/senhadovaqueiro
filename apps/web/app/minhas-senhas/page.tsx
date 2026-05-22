import { PublicShell } from "../../components/public-shell";
import { MyTicketsClient } from "./_components/my-tickets-client";

export default function MinhasSenhasPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-3xl">Minhas senhas</h1>
          <p className="mt-2 text-muted-foreground">
            Consulte suas senhas compradas e acompanhe o pagamento.
          </p>
        </div>
        <MyTicketsClient />
      </section>
    </PublicShell>
  );
}
