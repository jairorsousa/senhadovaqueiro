import { AdminShell } from "../../../../../components/admin-shell";
import { EventAdminTabs } from "../_components/event-admin-tabs";
import { CategoriesManager } from "./categories-manager";

export default async function AdminEventCategoriesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventAdminTabs eventId={id} />
        <CategoriesManager eventId={id} />
      </section>
    </AdminShell>
  );
}
