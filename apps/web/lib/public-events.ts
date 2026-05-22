import { apiClient } from "./api-client";

export type PublicTicketMap = {
  id: string;
  eventDayId: string | null;
  name: string;
  firstNumber: number;
  lastNumber: number;
  availableNumbers: number;
};

export type PublicCategory = {
  id: string;
  name: string;
  description: string | null;
  ticketPrice: string;
  prizeAmount: string | null;
  cattleCount: number | null;
  usesDays: boolean;
  status: "ACTIVE";
  ticketMaps: PublicTicketMap[];
};

export type PublicEventDay = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
};

export type PublicEvent = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  location: string;
  description: string | null;
  rules: string | null;
  bannerUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: "ACTIVE";
  categories: PublicCategory[];
  days: PublicEventDay[];
};

export type PublicTicketNumber = {
  id: string;
  number: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD" | "BLOCKED";
};

export function listPublicEvents(query?: string) {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiClient<{ events: PublicEvent[] }>(`/events${params}`);
}

export function getPublicEvent(slug: string) {
  return apiClient<PublicEvent>(`/events/${slug}`);
}

export function listPublicCategories(eventId: string) {
  return apiClient<{ categories: PublicCategory[] }>(`/events/${eventId}/categories`);
}

export function listPublicCategoryDays(categoryId: string) {
  return apiClient<{ days: PublicEventDay[] }>(`/categories/${categoryId}/days`);
}

export function listPublicTicketNumbers(ticketMapId: string) {
  return apiClient<{ numbers: PublicTicketNumber[] }>(`/ticket-maps/${ticketMapId}/numbers`);
}

export function formatEventPeriod(event: Pick<PublicEvent, "startsAt" | "endsAt">) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  });

  return `${formatter.format(new Date(event.startsAt))} a ${formatter.format(new Date(event.endsAt))}`;
}

export function formatCurrency(value: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value));
}
