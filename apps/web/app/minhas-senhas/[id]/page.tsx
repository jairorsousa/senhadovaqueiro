import { PublicShell } from "../../../components/public-shell";
import { MyTicketDetailClient } from "../_components/my-ticket-detail-client";

export default async function MinhaSenhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <MyTicketDetailClient ticketId={id} />
      </section>
    </PublicShell>
  );
}
