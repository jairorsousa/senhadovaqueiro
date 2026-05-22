import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IdentifyCheckoutDto } from "../dto/identify-checkout.dto";
import { ReserveCheckoutDto } from "../dto/reserve-checkout.dto";
import { CheckoutService } from "../services/checkout.service";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post("reserve")
  reserve(@Body() body: ReserveCheckoutDto) {
    return this.checkoutService.reserve(body);
  }

  @Get(":orderId")
  find(@Param("orderId") orderId: string) {
    return this.checkoutService.find(orderId);
  }

  @Post(":orderId/identify")
  identify(@Param("orderId") orderId: string, @Body() body: IdentifyCheckoutDto) {
    return this.checkoutService.identify(orderId, body);
  }

  @Post(":orderId/cancel")
  cancel(@Param("orderId") orderId: string) {
    return this.checkoutService.cancel(orderId);
  }
}
