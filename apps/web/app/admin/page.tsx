import { Banknote, Clock, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { AdminStatsCard, Badge, DataTable, StatusBadge } from "@senha-do-vaqueiro/ui";
import { AdminShell } from "../../components/admin-shell";

const rows = [
  {
    name: "Vaquejada Parque Modelo",
    city: "Petrolina/PE",
    date: "10 a 12 de julho",
    status: "ativa"
  }
];

export default function AdminPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatsCard
            label="Senhas vendidas"
            value="128"
            description="42% do mapa"
            icon={Ticket}
          />
          <AdminStatsCard
            label="Receita total"
            value="R$ 32.000"
            description="Pagamentos confirmados"
            icon={Banknote}
          />
          <AdminStatsCard
            label="Disponíveis"
            value="172"
            description="Senhas restantes"
            icon={Users}
          />
          <AdminStatsCard label="Pendentes" value="18" description="Aguardando Pix" icon={Clock} />
        </div>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">Vaquejadas</h2>
            <p className="text-sm text-muted-foreground">
              Acompanhe status, vendas e configuração dos eventos.
            </p>
          </div>
          <Link
            href="/admin/vaquejadas/nova"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary transition hover:brightness-110"
          >
            Nova vaquejada
          </Link>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Nome", cell: (row) => row.name },
            { key: "city", header: "Cidade/UF", cell: (row) => row.city },
            { key: "date", header: "Data", cell: (row) => row.date },
            { key: "status", header: "Status", cell: () => <StatusBadge status="ativa" /> },
            {
              key: "sales",
              header: "Vendas",
              cell: () => <Badge variant="accent">128 senhas</Badge>
            }
          ]}
          data={rows}
        />
      </section>
    </AdminShell>
  );
}
