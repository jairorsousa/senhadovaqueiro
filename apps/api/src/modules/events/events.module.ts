import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminEventsController } from "./controllers/admin-events.controller";
import { PublicEventsController } from "./controllers/public-events.controller";
import { EventsAccessController } from "./events-access.controller";
import { EventsService } from "./services/events.service";
import { PublicEventsService } from "./services/public-events.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminEventsController, PublicEventsController, EventsAccessController],
  providers: [EventsService, PublicEventsService]
})
export class EventsModule {}
