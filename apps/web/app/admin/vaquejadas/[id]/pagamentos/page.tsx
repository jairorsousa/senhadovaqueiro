import { AdminShell } from "../../../../../components/admin-shell";
import { EventAdminTabs } from "../_components/event-admin-tabs";
import { OrganizerPaymentsClient } from "./payments-client";

export default async function OrganizerPaymentsPage({
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
          <h2 className="text-3xl">Pagamentos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta de pagamentos por status, CPF, categoria e dia.
          </p>
        </div>
        <OrganizerPaymentsClient eventId={id} />
      </section>
    </AdminShell>
  );
}
