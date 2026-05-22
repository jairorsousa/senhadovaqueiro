import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CheckoutController } from "./controllers/checkout.controller";
import { CheckoutService } from "./services/checkout.service";

@Module({
  imports: [AuthModule],
  controllers: [CheckoutController],
  providers: [CheckoutService]
})
export class CheckoutModule {}
