import Link from "next/link";
import { CheckCircle, MapPin, QrCode, Search, ShieldCheck, Ticket } from "lucide-react";
import { Button, CategoryBadge, Input, StatusBadge } from "@senha-do-vaqueiro/ui";
import { PublicShell } from "../components/public-shell";
import { PublicEventsBrowser } from "./vaquejadas/_components/public-events-browser";

export default function HomePage() {
  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1fr_420px] md:px-6 md:py-12">
        <div className="space-y-6">
          <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary">
            <Ticket aria-hidden="true" className="h-4 w-4" />
            Senhas online para vaquejada
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Compre sua senha de vaquejada de forma rápida e segura.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Escolha a vaquejada, selecione sua categoria, pegue o número da senha e pague com Pix.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/vaquejadas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-base font-semibold text-primary-foreground shadow-primary hover:brightness-110"
            >
              <Ticket aria-hidden="true" className="h-5 w-5" />
              Comprar senha
            </Link>
            <Link
              href="/minhas-senhas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-border px-5 py-2 text-base font-semibold text-foreground hover:bg-muted"
            >
              Ver minhas senhas
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Compra segura" },
              { icon: QrCode, label: "Senha com QR Code" },
              { icon: CheckCircle, label: "Pagamento confirmado" }
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-card px-3"
              >
                <item.icon aria-hidden="true" className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="gradient-arena mb-4 grid min-h-44 place-items-end rounded-md p-4">
            <div className="w-full rounded-md border border-white/15 bg-black/28 p-3 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/75">Próxima vaquejada</p>
                  <h2 className="text-2xl text-white">Parque Modelo</h2>
                </div>
                <StatusBadge status="ativa" />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                Petrolina/PE
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <Input
              aria-label="Buscar vaquejada"
              placeholder="Busque por cidade, estado ou evento"
            />
            <div className="flex flex-wrap gap-2">
              <CategoryBadge name="Aberta" />
              <CategoryBadge name="Aspirante" />
              <CategoryBadge name="Amador" />
            </div>
            <Button className="w-full">
              <Search aria-hidden="true" className="h-4 w-4" />
              Encontrar vaquejada
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-5 px-4 pb-12 md:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Vaquejadas em destaque</p>
          <h2 className="text-2xl">Prontas para compra</h2>
        </div>
        <PublicEventsBrowser compact />
      </section>
    </PublicShell>
  );
}
