import { Controller, Get, Param, Post } from "@nestjs/common";
import { PaymentsService } from "../services/payments.service";

@Controller("checkout/:orderId/payment")
export class CheckoutPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Param("orderId") orderId: string) {
    return this.paymentsService.createCheckoutPayment(orderId);
  }

  @Get()
  find(@Param("orderId") orderId: string) {
    return this.paymentsService.findCheckoutPayment(orderId);
  }
}
