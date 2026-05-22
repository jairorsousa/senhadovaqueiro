import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { CheckoutPaymentsController } from "./controllers/checkout-payments.controller";
import { PaymentWebhooksController } from "./controllers/payment-webhooks.controller";
import { FakePixPaymentProvider } from "./providers/fake-pix-payment.provider";
import { PaymentsService } from "./services/payments.service";

@Module({
  imports: [PrismaModule],
  controllers: [CheckoutPaymentsController, PaymentWebhooksController],
  providers: [PaymentsService, FakePixPaymentProvider],
  exports: [PaymentsService]
})
export class PaymentsModule {}
