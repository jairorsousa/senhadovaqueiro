import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../../common/guards/admin-auth.guard";
import { EventAccessGuard } from "../../common/guards/event-access.guard";

@Controller("admin/events")
export class EventsAccessController {
  @Get(":eventId/access-check")
  @UseGuards(AdminAuthGuard, EventAccessGuard)
  checkAccess(@Param("eventId") eventId: string) {
    return {
      eventId,
      access: "granted"
    };
  }
}
