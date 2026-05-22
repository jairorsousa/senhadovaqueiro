import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminEventDaysController } from "./controllers/admin-event-days.controller";
import { EventDaysService } from "./services/event-days.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminEventDaysController],
  providers: [EventDaysService]
})
export class EventDaysModule {}
