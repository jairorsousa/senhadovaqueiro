"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent } from "@senha-do-vaqueiro/ui";
import {
  identifyCheckout,
  reserveCheckout,
  type CheckoutApiError,
  type CheckoutOrder
} from "../../../lib/checkout";
import {
  listPublicCategoryDays,
  listPublicTicketNumbers,
  type PublicCategory,
  type PublicEvent,
  type PublicTicketMap,
  type PublicTicketNumber
} from "../../../lib/public-events";
import { CategoryStep } from "./category-step";
import { CheckoutSummary } from "./checkout-summary";
import { ConfirmDataStep } from "./confirm-data-step";
import { DayStep } from "./day-step";
import { IdentificationStep, type IdentificationPayload } from "./identification-step";
import { PaymentStep } from "./payment-step";
import { TicketSelectionStep } from "./ticket-selection-step";

type CheckoutStep = "category" | "day" | "tickets" | "identify" | "confirm" | "payment";

const steps: Array<{ id: CheckoutStep; label: string }> = [
  { id: "category", label: "Categoria" },
  { id: "day", label: "Dia" },
  { id: "tickets", label: "Senhas" },
  { id: "identify", label: "Identificação" },
  { id: "confirm", label: "Confirmação" },
  { id: "payment", label: "Pix" }
];

export function CheckoutStepper({ event }: { event: PublicEvent }) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const initialCategoryId = searchParams.get("categoria") ?? "";
  const initialCategory = event.categories.find((category) => category.id === initialCategoryId);
  const [step, setStep] = useState<CheckoutStep>(
    initialCategoryId ? (initialCategory?.usesDays ? "day" : "tickets") : "category"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedDayId, setSelectedDayId] = useState("");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = event.categories.find((category) => category.id === selectedCategoryId);
  const daysQuery = useQuery({
    queryKey: ["public-category-days", selectedCategoryId],
    queryFn: () => listPublicCategoryDays(selectedCategoryId),
    enabled: Boolean(selectedCategory?.usesDays && selectedCategoryId)
  });
  const selectedDay = daysQuery.data?.days.find((day) => day.id === selectedDayId) ?? null;
  const selectedMap = useMemo(
    () => pickTicketMap(selectedCategory, selectedDayId),
    [selectedCategory, selectedDayId]
  );
  const numbersQuery = useQuery({
    queryKey: ["public-ticket-numbers", selectedMap?.id],
    queryFn: () => listPublicTicketNumbers(selectedMap?.id ?? ""),
    enabled: Boolean(selectedMap?.id)
  });
  const selectedNumbers = (numbersQuery.data?.numbers ?? [])
    .filter((ticket) => selectedTicketIds.includes(ticket.id))
    .map((ticket) => ticket.number);

  const reserveMutation = useMutation({
    mutationFn: () =>
      reserveCheckout({
        eventId: event.id,
        categoryId: selectedCategoryId,
        ...(selectedDayId ? { eventDayId: selectedDayId } : {}),
        ticketNumberIds: selectedTicketIds
      }),
    onSuccess: async (createdOrder) => {
      setOrder(createdOrder);
      setError(null);
      setStep("identify");
      await queryClient.invalidateQueries({ queryKey: ["public-ticket-numbers", selectedMap?.id] });
    },
    onError: (apiError: CheckoutApiError) => {
      setError(apiError.error?.message ?? "Nao foi possivel reservar as senhas.");
      void queryClient.invalidateQueries({ queryKey: ["public-ticket-numbers", selectedMap?.id] });
    }
  });
  const identifyMutation = useMutation({
    mutationFn: (payload: IdentificationPayload) => {
      if (!order) throw new Error("Pedido nao reservado.");
      return identifyCheckout(order.id, payload);
    },
    onSuccess: (identifiedOrder) => {
      setOrder(identifiedOrder);
      setError(null);
      setStep("confirm");
    },
    onError: (apiError: CheckoutApiError) => {
      setError(apiError.error?.message ?? "Nao foi possivel identificar o vaqueiro.");
    }
  });

  function chooseCategory(categoryId: string) {
    const category = event.categories.find((item) => item.id === categoryId);
    setSelectedCategoryId(categoryId);
    setSelectedDayId("");
    setSelectedTicketIds([]);
    setOrder(null);
    setError(null);
    setStep(category?.usesDays ? "day" : "tickets");
  }

  function chooseDay(dayId: string) {
    setSelectedDayId(dayId);
    setSelectedTicketIds([]);
    setError(null);
    setStep("tickets");
  }

  function toggleTicket(ticket: PublicTicketNumber) {
    if (ticket.status !== "AVAILABLE") return;
    setSelectedTicketIds((current) =>
      current.includes(ticket.id)
        ? current.filter((ticketId) => ticketId !== ticket.id)
        : [...current, ticket.id]
    );
  }

  return (
    <section id="checkout" className="mx-auto max-w-6xl px-4 pb-14 md:px-6">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Fluxo guiado</p>
        <h2 className="text-2xl">Comprar senha</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <StepHeader currentStep={step} categoryUsesDays={Boolean(selectedCategory?.usesDays)} />
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          ) : null}
          <Card>
            <CardContent className="p-4">
              {step === "category" ? (
                <CategoryStep
                  categories={event.categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={chooseCategory}
                />
              ) : null}
              {step === "day" && selectedCategory ? (
                <DayStep
                  days={daysQuery.data?.days ?? []}
                  selectedDayId={selectedDayId}
                  onSelect={chooseDay}
                />
              ) : null}
              {step === "tickets" ? (
                <TicketSelectionStep
                  numbers={numbersQuery.data?.numbers ?? []}
                  selectedIds={selectedTicketIds}
                  isLoading={numbersQuery.isLoading}
                  loading={reserveMutation.isPending}
                  onToggle={toggleTicket}
                  onReserve={() => reserveMutation.mutate()}
                />
              ) : null}
              {step === "identify" ? (
                <IdentificationStep
                  loading={identifyMutation.isPending}
                  onSubmit={(payload) => identifyMutation.mutate(payload)}
                />
              ) : null}
              {step === "confirm" && order ? (
                <ConfirmDataStep order={order} onConfirm={() => setStep("payment")} />
              ) : null}
              {step === "payment" && order ? <PaymentStep order={order} /> : null}
            </CardContent>
          </Card>
          <StepActions
            step={step}
            onBack={() => {
              setError(null);
              setStep(previousStep(step, Boolean(selectedCategory?.usesDays)));
            }}
          />
        </div>

        <CheckoutSummary
          event={event}
          category={selectedCategory}
          day={selectedDay}
          selectedNumbers={selectedNumbers}
          order={order}
        />
      </div>
    </section>
  );
}

function StepHeader({
  currentStep,
  categoryUsesDays
}: {
  currentStep: CheckoutStep;
  categoryUsesDays: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps
        .filter((step) => categoryUsesDays || step.id !== "day")
        .map((step) => (
          <Badge key={step.id} variant={step.id === currentStep ? "primary" : "outline"}>
            {step.label}
          </Badge>
        ))}
    </div>
  );
}

function StepActions({ step, onBack }: { step: CheckoutStep; onBack: () => void }) {
  if (step === "category" || step === "payment") return null;

  return (
    <Button type="button" variant="outline" onClick={onBack}>
      Voltar
    </Button>
  );
}

function previousStep(step: CheckoutStep, categoryUsesDays: boolean): CheckoutStep {
  if (step === "day") return "category";
  if (step === "tickets") return categoryUsesDays ? "day" : "category";
  if (step === "identify") return "tickets";
  if (step === "confirm") return "identify";
  return "category";
}

function pickTicketMap(
  category: PublicCategory | undefined,
  selectedDayId: string
): PublicTicketMap | null {
  if (!category) return null;

  if (category.usesDays) {
    if (!selectedDayId) return null;
    return category.ticketMaps.find((map) => map.eventDayId === selectedDayId) ?? null;
  }

  return (
    category.ticketMaps.find((map) => map.eventDayId === null) ?? category.ticketMaps[0] ?? null
  );
}
