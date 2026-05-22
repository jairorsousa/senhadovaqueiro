import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminTicketMapController } from "./controllers/admin-ticket-map.controller";
import { PublicTicketMapController } from "./controllers/public-ticket-map.controller";
import { TicketMapService } from "./services/ticket-map.service";
import { PublicTicketMapService } from "./services/public-ticket-map.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminTicketMapController, PublicTicketMapController],
  providers: [TicketMapService, PublicTicketMapService]
})
export class TicketMapModule {}
