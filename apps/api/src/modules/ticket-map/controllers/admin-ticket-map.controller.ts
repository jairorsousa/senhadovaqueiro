import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { CreateTicketMapDto } from "../dto/create-ticket-map.dto";
import { TicketMapService } from "../services/ticket-map.service";

@Controller("admin")
@UseGuards(AdminAuthGuard)
export class AdminTicketMapController {
  constructor(private readonly ticketMapService: TicketMapService) {}

  @Get("categories/:categoryId/ticket-maps")
  async list(@Param("categoryId") categoryId: string, @CurrentUser() user: AdminPrincipal) {
    return { ticketMaps: await this.ticketMapService.list(categoryId, user) };
  }

  @Post("categories/:categoryId/ticket-maps")
  create(
    @Param("categoryId") categoryId: string,
    @Body() body: CreateTicketMapDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.ticketMapService.create(categoryId, body, user);
  }

  @Get("ticket-maps/:id/numbers")
  numbers(@Param("id") id: string, @CurrentUser() user: AdminPrincipal) {
    return this.ticketMapService.numbers(id, user);
  }

  @Post("ticket-numbers/:id/block")
  block(@Param("id") id: string, @CurrentUser() user: AdminPrincipal) {
    return this.ticketMapService.blockNumber(id, user);
  }

  @Post("ticket-numbers/:id/unblock")
  unblock(@Param("id") id: string, @CurrentUser() user: AdminPrincipal) {
    return this.ticketMapService.unblockNumber(id, user);
  }
}
