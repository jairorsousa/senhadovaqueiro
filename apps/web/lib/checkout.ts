import { apiClient } from "./api-client";

export type CheckoutOrderStatus =
  | "DRAFT"
  | "WAITING_PAYMENT"
  | "PAID"
  | "EXPIRED"
  | "CANCELLED"
  | "PAYMENT_FAILED";

export type CheckoutOrder = {
  id: string;
  eventId: string;
  cowboyId: string | null;
  status: CheckoutOrderStatus;
  totalAmount: string;
  expiresAt: string | null;
  cowboy: {
    id: string;
    name: string;
    cpf: string;
    whatsapp: string;
  } | null;
  event: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
  };
  items: Array<{
    id: string;
    ticketNumberId: string;
    number: number;
    status: string;
    unitPrice: string;
    category: {
      id: string;
      name: string;
      usesDays: boolean;
    };
    day: {
      id: string;
      name: string;
      startsAt: string;
    } | null;
  }>;
};

export type CheckoutApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type CheckoutPaymentStatus = "WAITING_PAYMENT" | "PAID" | "EXPIRED" | "CANCELLED" | "FAILED";

export type CheckoutPayment = {
  id: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  status: CheckoutPaymentStatus;
  amount: string;
  pixQrCode: string | null;
  pixCopyPaste: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function reserveCheckout(payload: {
  eventId: string;
  categoryId: string;
  eventDayId?: string;
  ticketNumberIds: string[];
}) {
  return apiClient<CheckoutOrder>("/checkout/reserve", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCheckoutOrder(orderId: string) {
  return apiClient<CheckoutOrder>(`/checkout/${orderId}`);
}

export function identifyCheckout(
  orderId: string,
  payload: { name: string; cpf: string; whatsapp: string; password: string }
) {
  return apiClient<CheckoutOrder>(`/checkout/${orderId}/identify`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function cancelCheckout(orderId: string) {
  return apiClient<CheckoutOrder>(`/checkout/${orderId}/cancel`, {
    method: "POST"
  });
}

export function createCheckoutPayment(orderId: string) {
  return apiClient<CheckoutPayment>(`/checkout/${orderId}/payment`, {
    method: "POST"
  });
}

export function getCheckoutPayment(orderId: string) {
  return apiClient<CheckoutPayment>(`/checkout/${orderId}/payment`);
}
