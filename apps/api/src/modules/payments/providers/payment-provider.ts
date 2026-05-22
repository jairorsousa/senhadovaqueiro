import type { PaymentStatus } from "@prisma/client";

export type CreatePixChargeInput = {
  orderId: string;
  amount: string;
  expiresAt: Date;
  description: string;
};

export type CreatePixChargeResult = {
  provider: string;
  providerPaymentId: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: Date;
};

export type PaymentWebhookEvent = {
  externalEventId: string;
  providerPaymentId: string;
  status: PaymentStatus;
  eventType: string;
  payload: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: string;
  createPixCharge(input: CreatePixChargeInput): Promise<CreatePixChargeResult>;
  parseWebhook(payload: Record<string, unknown>): PaymentWebhookEvent;
}
