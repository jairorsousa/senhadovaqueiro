import { PublicShell } from "../../../components/public-shell";
import { PublicEventDetail } from "./event-detail-client";

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <PublicShell>
      <PublicEventDetail slug={slug} />
    </PublicShell>
  );
}
