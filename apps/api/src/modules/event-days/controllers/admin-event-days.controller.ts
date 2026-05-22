import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { CreateEventDayDto } from "../dto/create-event-day.dto";
import { UpdateEventDayDto } from "../dto/update-event-day.dto";
import { EventDaysService } from "../services/event-days.service";

@Controller("admin")
@UseGuards(AdminAuthGuard)
export class AdminEventDaysController {
  constructor(private readonly eventDaysService: EventDaysService) {}

  @Get("events/:eventId/days")
  async list(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return { days: await this.eventDaysService.list(eventId, user) };
  }

  @Post("events/:eventId/days")
  create(
    @Param("eventId") eventId: string,
    @Body() body: CreateEventDayDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.eventDaysService.create(eventId, body, user);
  }

  @Patch("days/:id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateEventDayDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.eventDaysService.update(id, body, user);
  }
}
