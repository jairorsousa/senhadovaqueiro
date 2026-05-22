import { AdminShell } from "../../../../../components/admin-shell";
import { EventEditLoader } from "../../_components/event-edit-loader";

export default async function EditAdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventEditLoader id={id} />
      </section>
    </AdminShell>
  );
}
