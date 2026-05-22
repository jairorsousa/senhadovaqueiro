import { apiClient } from "./api-client";

export type AdminEventStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "CANCELLED";

export type AdminEvent = {
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
  status: AdminEventStatus;
  counts: {
    categories: number;
    eventDays: number;
    ticketMaps: number;
    orders: number;
  };
  organizers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>;
  publicationChecklist: {
    hasMainInfo: boolean;
    hasActiveCategory: boolean;
    hasTicketMap: boolean;
    hasValidDates: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type EventPayload = {
  name: string;
  city: string;
  state: string;
  location: string;
  description?: string;
  rules?: string;
  bannerUrl?: string;
  startsAt: string;
  endsAt: string;
  status?: "CANCELLED";
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
};

export async function listAdminEvents() {
  return apiClient<{ events: AdminEvent[] }>("/admin/events");
}

export async function getAdminEvent(id: string) {
  return apiClient<AdminEvent>(`/admin/events/${id}`);
}

export async function createAdminEvent(payload: EventPayload) {
  return apiClient<AdminEvent>("/admin/events", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminEvent(id: string, payload: EventPayload) {
  return apiClient<AdminEvent>(`/admin/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function publishAdminEvent(id: string) {
  return apiClient<AdminEvent>(`/admin/events/${id}/publish`, {
    method: "POST"
  });
}

export async function archiveAdminEvent(id: string) {
  return apiClient<AdminEvent>(`/admin/events/${id}/archive`, {
    method: "POST"
  });
}

export function statusLabel(status: AdminEventStatus) {
  const labels = {
    DRAFT: "rascunho",
    ACTIVE: "ativa",
    CLOSED: "encerrada",
    CANCELLED: "cancelada"
  } as const;

  return labels[status];
}
