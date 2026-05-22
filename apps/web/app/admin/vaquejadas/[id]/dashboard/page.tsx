import { AdminShell } from "../../../../../components/admin-shell";
import { EventAdminTabs } from "../_components/event-admin-tabs";
import { OrganizerDashboardClient } from "./dashboard-client";

export default async function OrganizerDashboardPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventAdminTabs eventId={id} />
        <div className="mb-6">
          <h2 className="text-3xl">Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Indicadores de vendas e pagamentos.</p>
        </div>
        <OrganizerDashboardClient eventId={id} />
      </section>
    </AdminShell>
  );
}
