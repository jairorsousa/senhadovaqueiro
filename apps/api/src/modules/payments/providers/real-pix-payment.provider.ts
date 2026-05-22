import { ServiceUnavailableException } from "@nestjs/common";
import type {
  CreatePixChargeInput,
  CreatePixChargeResult,
  PaymentProvider,
  PaymentWebhookEvent
} from "./payment-provider";

export class RealPixPaymentProvider implements PaymentProvider {
  constructor(readonly name: string) {}

  async createPixCharge(_input: CreatePixChargeInput): Promise<CreatePixChargeResult> {
    throw new ServiceUnavailableException({
      code: "PIX_PROVIDER_NOT_CONFIGURED",
      message: "Configure o adapter real do provedor Pix antes de usar pagamentos reais."
    });
  }

  parseWebhook(_payload: Record<string, unknown>): PaymentWebhookEvent {
    throw new ServiceUnavailableException({
      code: "PIX_PROVIDER_NOT_CONFIGURED",
      message: "Configure o adapter real do provedor Pix antes de receber webhooks reais."
    });
  }
}
