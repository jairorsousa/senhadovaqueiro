"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CategoryBadge,
  Skeleton
} from "@senha-do-vaqueiro/ui";
import {
  formatCurrency,
  formatEventPeriod,
  getPublicEvent,
  type PublicCategory
} from "../../../lib/public-events";
import { CheckoutStepper } from "../../checkout/_components/checkout-stepper";

export function PublicEventDetail({ slug }: { slug: string }) {
  const {
    data: event,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["public-event", slug],
    queryFn: () => getPublicEvent(slug)
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <Skeleton className="h-96" />
      </section>
    );
  }

  if (isError || !event) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          Vaquejada nao encontrada para compra.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[1fr_360px] md:px-6">
        <div className="space-y-6">
          <div className="gradient-arena grid min-h-64 place-items-end rounded-lg border border-border p-5">
            <div className="w-full rounded-md border border-white/15 bg-black/30 p-4 text-white backdrop-blur">
              <Badge variant="accent">ativa</Badge>
              <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{event.name}</h1>
              <p className="mt-3 flex flex-wrap gap-4 text-sm text-white/85">
                <span className="inline-flex items-center gap-2">
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                  {event.location} · {event.city}/{event.state}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  {formatEventPeriod(event)}
                </span>
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sobre a vaquejada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>{event.description ?? "Informações da vaquejada disponíveis em breve."}</p>
              {event.rules ? (
                <div>
                  <p className="font-semibold text-foreground">Regulamento</p>
                  <p>{event.rules}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comprar senha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha uma categoria para iniciar o fluxo guiado de compra.
              </p>
              <a
                href="#checkout"
                aria-disabled={event.categories.length === 0}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary transition hover:brightness-110 aria-disabled:pointer-events-none aria-disabled:opacity-55"
              >
                <Ticket aria-hidden="true" className="h-4 w-4" />
                Comprar senha
              </a>
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-accent" />
                Pagamento Pix e confirmação da senha nas próximas etapas.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {event.days.length ? (
                event.days.map((day) => (
                  <div
                    key={day.id}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    <strong>{day.name}</strong>
                    <p className="text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(
                        new Date(day.startsAt)
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Datas detalhadas em breve.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 pb-12 md:px-6">
        <div>
          <p className="text-sm text-muted-foreground">Categorias disponíveis</p>
          <h2 className="text-2xl">Escolha onde correr</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {event.categories.map((category) => (
            <CategoryCard key={category.id} category={category} eventSlug={event.slug} />
          ))}
        </div>
      </section>

      <CheckoutStepper event={event} />
    </>
  );
}

function CategoryCard({ category, eventSlug }: { category: PublicCategory; eventSlug: string }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CategoryBadge name={category.name} />
            <h3 className="mt-3 text-xl">{category.name}</h3>
          </div>
          <Badge variant={category.usesDays ? "info" : "accent"}>
            {category.usesDays ? "por dia" : "direto"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {category.description ?? "Categoria aberta para compra de senhas."}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Info label="Senha" value={formatCurrency(category.ticketPrice)} />
          <Info
            label="Premiação"
            value={category.prizeAmount ? formatCurrency(category.prizeAmount) : "-"}
          />
          <Info label="Bois" value={category.cattleCount?.toString() ?? "-"} />
          <Info label="Mapas" value={category.ticketMaps.length.toString()} />
        </div>
        <Link
          href={`/vaquejadas/${eventSlug}?categoria=${category.id}#checkout`}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-primary hover:brightness-110"
        >
          <Ticket aria-hidden="true" className="h-4 w-4" />
          Comprar senha
        </Link>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
