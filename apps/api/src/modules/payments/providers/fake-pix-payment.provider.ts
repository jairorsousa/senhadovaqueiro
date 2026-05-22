import { randomUUID } from "node:crypto";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import type {
  CreatePixChargeInput,
  CreatePixChargeResult,
  PaymentProvider,
  PaymentWebhookEvent
} from "./payment-provider";

@Injectable()
export class FakePixPaymentProvider implements PaymentProvider {
  readonly name = "fake";

  async createPixCharge(input: CreatePixChargeInput): Promise<CreatePixChargeResult> {
    const providerPaymentId = `fake_pix_${input.orderId}_${randomUUID()}`;
    const pixCopyPaste = [
      "PIX-FAKE",
      `pedido=${input.orderId}`,
      `valor=${input.amount}`,
      `expira=${input.expiresAt.toISOString()}`
    ].join("|");

    return {
      provider: this.name,
      providerPaymentId,
      pixCopyPaste,
      pixQrCode: this.buildQrCode(providerPaymentId, pixCopyPaste),
      expiresAt: input.expiresAt
    };
  }

  parseWebhook(payload: Record<string, unknown>): PaymentWebhookEvent {
    const providerPaymentId = this.readString(payload, "providerPaymentId", "paymentId", "id");
    const rawStatus = this.readString(payload, "status").toUpperCase();
    const status = this.normalizeStatus(rawStatus);
    const externalEventId =
      this.readOptionalString(payload, "externalEventId", "eventId") ??
      `${providerPaymentId}:${status}`;

    return {
      externalEventId,
      providerPaymentId,
      status,
      eventType: `payment.${status.toLowerCase()}`,
      payload
    };
  }

  private normalizeStatus(status: string): PaymentStatus {
    if (status === "CONFIRMED" || status === "COMPLETED") return PaymentStatus.PAID;
    if (status in PaymentStatus) return PaymentStatus[status as keyof typeof PaymentStatus];

    throw new BadRequestException({
      code: "INVALID_PAYMENT_STATUS",
      message: "Status de pagamento invalido para o webhook Pix."
    });
  }

  private readString(payload: Record<string, unknown>, ...keys: string[]) {
    const value = this.readOptionalString(payload, ...keys);

    if (!value) {
      throw new BadRequestException({
        code: "INVALID_PAYMENT_WEBHOOK",
        message: `Informe ${keys[0]} no webhook Pix.`
      });
    }

    return value;
  }

  private readOptionalString(payload: Record<string, unknown>, ...keys: string[]) {
    for (const key of keys) {
      const value = payload[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }

    return null;
  }

  private buildQrCode(seed: string, label: string) {
    const cells = Array.from({ length: 21 * 21 }, (_, index) => {
      const code = seed.charCodeAt(index % seed.length) + index * 17;
      return code % 5 === 0 || code % 7 === 0;
    });
    const rects = cells
      .map((enabled, index) => {
        if (!enabled) return "";
        const x = (index % 21) * 8;
        const y = Math.floor(index / 21) * 8;
        return `<rect x="${x}" y="${y}" width="8" height="8" fill="#111827"/>`;
      })
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168" role="img" aria-label="${label}"><rect width="168" height="168" fill="#fff"/><rect x="0" y="0" width="40" height="40" fill="#111827"/><rect x="128" y="0" width="40" height="40" fill="#111827"/><rect x="0" y="128" width="40" height="40" fill="#111827"/>${rects}</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}
