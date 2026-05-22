import { AdminShell } from "../../../../../components/admin-shell";
import { EventAdminTabs } from "../_components/event-admin-tabs";
import { OrganizerTicketsClient } from "./tickets-client";

export default async function OrganizerTicketsPage({
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
          <h2 className="text-3xl">Senhas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Filtros, edição controlada e impressão individual.
          </p>
        </div>
        <OrganizerTicketsClient eventId={id} />
      </section>
    </AdminShell>
  );
}
