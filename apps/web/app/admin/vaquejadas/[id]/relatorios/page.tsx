import { AdminShell } from "../../../../../components/admin-shell";
import { EventAdminTabs } from "../_components/event-admin-tabs";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventAdminTabs eventId={id} />
        <div className="mb-6">
          <h2 className="text-3xl">Relatórios</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Categorias, dias, pagamentos, senhas vendidas e receita.
          </p>
        </div>
        <ReportsClient eventId={id} />
      </section>
    </AdminShell>
  );
}
