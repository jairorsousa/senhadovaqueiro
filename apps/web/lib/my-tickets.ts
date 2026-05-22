import { apiClient } from "./api-client";

export type MyTicketStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "CANCELLED"
  | "BLOCKED";

export type MyTicketPaymentStatus = "waiting" | "paid" | "expired" | "refused";

export type MyTicket = {
  id: string;
  orderId: string;
  ticketNumberId: string;
  number: number;
  status: MyTicketStatus;
  canEdit: boolean;
  unitPrice: string;
  createdAt: string;
  cowboy: {
    id: string;
    name: string;
    cpf: string;
    whatsapp: string;
  };
  event: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    startsAt: string;
  };
  category: {
    id: string;
    name: string;
  };
  day: {
    id: string;
    name: string;
    startsAt: string;
  } | null;
  order: {
    id: string;
    status: string;
    totalAmount: string;
    expiresAt: string | null;
  };
  payment: {
    id: string;
    status: string;
    amount: string;
    pixCopyPaste: string | null;
    expiresAt: string | null;
    paidAt: string | null;
  } | null;
  paymentStatus: MyTicketPaymentStatus;
};

export type MyTicketPrint = {
  ticket: MyTicket;
  printable: {
    title: string;
    lines: string[];
  };
};

export function listMyTickets() {
  return apiClient<{ tickets: MyTicket[] }>("/me/tickets");
}

export function getMyTicket(id: string) {
  return apiClient<MyTicket>(`/me/tickets/${id}`);
}

export function updateMyTicket(id: string, payload: { name?: string; whatsapp?: string }) {
  return apiClient<MyTicket>(`/me/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getMyTicketPrint(id: string) {
  return apiClient<MyTicketPrint>(`/me/tickets/${id}/print`);
}
