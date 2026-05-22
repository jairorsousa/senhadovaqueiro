import { AdminShell } from "../../../../components/admin-shell";
import { EventForm } from "../_components/event-form";

export default function NewAdminEventPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <EventForm />
      </section>
    </AdminShell>
  );
}
