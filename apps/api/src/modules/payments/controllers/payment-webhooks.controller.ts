import { Body, Controller, Headers, Param, Post } from "@nestjs/common";
import { PaymentsService } from "../services/payments.service";

@Controller("webhooks/payments")
export class PaymentWebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(":provider")
  receive(
    @Param("provider") provider: string,
    @Body() body: Record<string, unknown>,
    @Headers("x-pix-webhook-secret") webhookSecret?: string
  ) {
    return this.paymentsService.handleWebhook(provider, body, webhookSecret);
  }
}
