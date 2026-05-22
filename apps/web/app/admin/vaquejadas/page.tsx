import { AdminShell } from "../../../components/admin-shell";
import { EventsList } from "./_components/events-list";

export default function AdminEventsPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventsList />
      </section>
    </AdminShell>
  );
}
