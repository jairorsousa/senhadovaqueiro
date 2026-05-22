import { apiClient } from "./api-client";

export type ReportPaymentStatus = "WAITING_PAYMENT" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";

export type AdminReportsSummary = {
  totals: {
    tickets: number;
    ticketsSold: number;
    revenueConfirmed: string;
    revenuePending: string;
    revenueTotal: string;
  };
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    ticketsSold: number;
    revenueConfirmed: string;
    revenuePending: string;
  }>;
  byDay: Array<{
    eventDayId: string | null;
    dayName: string;
    ticketsSold: number;
    revenueConfirmed: string;
    revenuePending: string;
  }>;
  byPaymentStatus: Array<{
    status: ReportPaymentStatus;
    count: number;
    amount: string;
  }>;
};

export type AdminReportTicket = {
  id: string;
  number: number;
  status: string;
  category: { id: string; name: string };
  day: { id: string; name: string } | null;
  cowboy: { id: string; name: string; cpf: string; whatsapp: string } | null;
  payment: {
    id: string;
    status: ReportPaymentStatus;
    amount: string;
    paidAt: string | null;
  } | null;
};

export type AdminReportPayment = {
  id: string;
  orderId: string;
  status: ReportPaymentStatus;
  amount: string;
  paidAt: string | null;
  createdAt: string;
  cowboy: { id: string; name: string; cpf: string } | null;
  tickets: Array<{ id: string; number: number; category: string; day: string }>;
};

export function getReportsSummary(eventId: string) {
  return apiClient<AdminReportsSummary>(`/admin/events/${eventId}/reports/summary`);
}

export function getReportsTickets(eventId: string) {
  return apiClient<{ tickets: AdminReportTicket[] }>(`/admin/events/${eventId}/reports/tickets`);
}

export function getReportsPayments(eventId: string) {
  return apiClient<{
    payments: AdminReportPayment[];
    byStatus: AdminReportsSummary["byPaymentStatus"];
  }>(`/admin/events/${eventId}/reports/payments`);
}

export function reportsCsvUrl(eventId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3333"}/admin/events/${eventId}/reports/export.csv`;
}
