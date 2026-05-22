import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { CreateEventDto } from "../dto/create-event.dto";
import { UpdateEventDto } from "../dto/update-event.dto";
import { EventsService } from "../services/events.service";

@Controller("admin/events")
@UseGuards(AdminAuthGuard)
export class AdminEventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async list(@CurrentUser() user: AdminPrincipal) {
    return {
      events: await this.eventsService.list(user)
    };
  }

  @Post()
  create(
    @Body() body: CreateEventDto,
    @CurrentUser() user: AdminPrincipal,
    @Req() request: Request
  ) {
    return this.eventsService.create(body, user, this.auditContext(user, request));
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AdminPrincipal) {
    return this.eventsService.findOne(id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateEventDto,
    @CurrentUser() user: AdminPrincipal,
    @Req() request: Request
  ) {
    return this.eventsService.update(id, body, user, this.auditContext(user, request));
  }

  @Post(":id/publish")
  publish(@Param("id") id: string, @CurrentUser() user: AdminPrincipal, @Req() request: Request) {
    return this.eventsService.publish(id, user, this.auditContext(user, request));
  }

  @Post(":id/archive")
  archive(@Param("id") id: string, @CurrentUser() user: AdminPrincipal, @Req() request: Request) {
    return this.eventsService.archive(id, user, this.auditContext(user, request));
  }

  private auditContext(user: AdminPrincipal, request: Request) {
    return {
      userId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"]?.toString()
    };
  }
}
