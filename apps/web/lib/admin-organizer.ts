import { apiClient } from "./api-client";

export type OrganizerTicketStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "BLOCKED";

export type OrganizerPaymentStatus =
  | "WAITING_PAYMENT"
  | "PAID"
  | "EXPIRED"
  | "CANCELLED"
  | "FAILED";

export type OrganizerDashboard = {
  ticketCounts: {
    sold: number;
    available: number;
    reserved: number;
    pending: number;
  };
  revenue: {
    confirmed: string;
    pending: string;
  };
  salesByCategory: Array<{ categoryId: string; categoryName: string; sold: number }>;
  salesByDay: Array<{ eventDayId: string | null; dayName: string; sold: number }>;
};

export type OrganizerTicket = {
  id: string;
  ticketMapId: string;
  number: number;
  status: OrganizerTicketStatus;
  reservedUntil: string | null;
  event: { id: string; name: string };
  category: { id: string; name: string };
  day: { id: string; name: string; startsAt: string } | null;
  order: { id: string; status: string; totalAmount: string } | null;
  cowboy: { id: string; name: string; cpf: string; whatsapp: string } | null;
  payment: {
    id: string;
    status: OrganizerPaymentStatus;
    amount: string;
    expiresAt: string | null;
    paidAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizerPayment = {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: OrganizerPaymentStatus;
  amount: string;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  cowboy: { id: string; name: string; cpf: string; whatsapp: string } | null;
  category: { id: string; name: string } | null;
  day: { id: string; name: string } | null;
  tickets: Array<{ id: string; number: number; status: OrganizerTicketStatus }>;
};

export type OrganizerTicketFilters = {
  categoryId?: string;
  eventDayId?: string;
  number?: string;
  name?: string;
  cpf?: string;
  ticketStatus?: string;
  paymentStatus?: string;
};

export function getOrganizerDashboard(eventId: string) {
  return apiClient<OrganizerDashboard>(`/admin/events/${eventId}/dashboard`);
}

export function listOrganizerTickets(eventId: string, filters: OrganizerTicketFilters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();

  return apiClient<{ tickets: OrganizerTicket[] }>(
    `/admin/events/${eventId}/tickets${query ? `?${query}` : ""}`
  );
}

export function listOrganizerPayments(
  eventId: string,
  filters: { status?: string; categoryId?: string; eventDayId?: string; cpf?: string } = {}
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();

  return apiClient<{ payments: OrganizerPayment[] }>(
    `/admin/events/${eventId}/payments${query ? `?${query}` : ""}`
  );
}

export function updateOrganizerTicket(
  id: string,
  payload: { cowboyName?: string; cowboyWhatsapp?: string; status?: OrganizerTicketStatus }
) {
  return apiClient<OrganizerTicket>(`/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getOrganizerTicketPrint(id: string) {
  return apiClient<{
    ticket: OrganizerTicket;
    printable: {
      title: string;
      lines: string[];
    };
  }>(`/admin/tickets/${id}/print`);
}
