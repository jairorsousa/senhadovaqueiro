import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import { EventAccessGuard } from "../../../common/guards/event-access.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { AdminPaymentsQueryDto } from "../dto/admin-payments-query.dto";
import { AdminTicketsQueryDto } from "../dto/admin-tickets-query.dto";
import { UpdateAdminTicketDto } from "../dto/update-admin-ticket.dto";
import { OrganizerPanelService } from "../services/organizer-panel.service";

@Controller("admin")
@UseGuards(AdminAuthGuard)
export class OrganizerPanelController {
  constructor(private readonly organizerPanelService: OrganizerPanelService) {}

  @Get("events/:eventId/dashboard")
  @UseGuards(EventAccessGuard)
  dashboard(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return this.organizerPanelService.dashboard(eventId, user);
  }

  @Get("events/:eventId/tickets")
  @UseGuards(EventAccessGuard)
  tickets(
    @Param("eventId") eventId: string,
    @Query() query: AdminTicketsQueryDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.organizerPanelService.tickets(eventId, query, user);
  }

  @Get("events/:eventId/payments")
  @UseGuards(EventAccessGuard)
  payments(
    @Param("eventId") eventId: string,
    @Query() query: AdminPaymentsQueryDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.organizerPanelService.payments(eventId, query, user);
  }

  @Patch("tickets/:id")
  updateTicket(
    @Param("id") id: string,
    @Body() body: UpdateAdminTicketDto,
    @CurrentUser() user: AdminPrincipal,
    @Req() request: Request
  ) {
    return this.organizerPanelService.updateTicket(id, body, user, {
      userId: user.id,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"]?.toString()
    });
  }

  @Get("tickets/:id/print")
  printTicket(@Param("id") id: string, @CurrentUser() user: AdminPrincipal) {
    return this.organizerPanelService.printTicket(id, user);
  }
}
