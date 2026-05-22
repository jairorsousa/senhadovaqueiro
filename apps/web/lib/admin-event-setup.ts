import { apiClient } from "./api-client";

export type AdminCategoryStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type AdminTicketStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "BLOCKED";

export type AdminCategory = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  ticketPrice: string;
  prizeAmount: string | null;
  cattleCount: number | null;
  usesDays: boolean;
  status: AdminCategoryStatus;
  sortOrder: number;
  counts: { days: number; ticketMaps: number };
};

export type AdminEventDay = {
  id: string;
  eventId: string;
  name: string;
  startsAt: string;
  endsAt: string | null;
  sortOrder: number;
  counts: { categories: number; ticketMaps: number };
};

export type AdminTicketMap = {
  id: string;
  eventId: string;
  categoryId: string;
  eventDayId: string | null;
  name: string;
  firstNumber: number;
  lastNumber: number;
  status: AdminCategoryStatus;
  category: { id: string; eventId: string; name: string; usesDays: boolean };
  eventDay: { id: string; name: string; startsAt: string } | null;
  counts: { ticketNumbers: number };
};

export type AdminTicketNumber = {
  id: string;
  ticketMapId: string;
  number: number;
  status: AdminTicketStatus;
  reservedUntil: string | null;
  currentOrderItemId: string | null;
};

export type CategoryPayload = {
  name: string;
  description?: string;
  ticketPrice: string;
  prizeAmount?: string;
  cattleCount?: number;
  usesDays: boolean;
  status?: AdminCategoryStatus;
  sortOrder?: number;
};

export type DayPayload = {
  name: string;
  startsAt: string;
  endsAt?: string;
  sortOrder?: number;
};

export type TicketMapPayload = {
  name: string;
  eventDayId?: string;
  firstNumber: number;
  lastNumber: number;
};

export function listCategories(eventId: string) {
  return apiClient<{ categories: AdminCategory[] }>(`/admin/events/${eventId}/categories`);
}

export function createCategory(eventId: string, payload: CategoryPayload) {
  return apiClient<AdminCategory>(`/admin/events/${eventId}/categories`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  return apiClient<AdminCategory>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function listDays(eventId: string) {
  return apiClient<{ days: AdminEventDay[] }>(`/admin/events/${eventId}/days`);
}

export function createDay(eventId: string, payload: DayPayload) {
  return apiClient<AdminEventDay>(`/admin/events/${eventId}/days`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateDay(id: string, payload: Partial<DayPayload>) {
  return apiClient<AdminEventDay>(`/admin/days/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function listTicketMaps(categoryId: string) {
  return apiClient<{ ticketMaps: AdminTicketMap[] }>(`/admin/categories/${categoryId}/ticket-maps`);
}

export function createTicketMap(categoryId: string, payload: TicketMapPayload) {
  return apiClient<AdminTicketMap>(`/admin/categories/${categoryId}/ticket-maps`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTicketMapNumbers(id: string) {
  return apiClient<{ map: AdminTicketMap; numbers: AdminTicketNumber[] }>(
    `/admin/ticket-maps/${id}/numbers`
  );
}

export function blockTicketNumber(id: string) {
  return apiClient<AdminTicketNumber>(`/admin/ticket-numbers/${id}/block`, { method: "POST" });
}

export function unblockTicketNumber(id: string) {
  return apiClient<AdminTicketNumber>(`/admin/ticket-numbers/${id}/unblock`, { method: "POST" });
}
