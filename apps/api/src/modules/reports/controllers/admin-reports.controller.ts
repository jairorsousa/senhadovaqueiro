import { Controller, Get, Header, Param, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import { EventAccessGuard } from "../../../common/guards/event-access.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { ReportsService } from "../services/reports.service";

@Controller("admin/events/:eventId/reports")
@UseGuards(AdminAuthGuard, EventAccessGuard)
export class AdminReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  summary(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return this.reportsService.summary(eventId, user);
  }

  @Get("tickets")
  tickets(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return this.reportsService.tickets(eventId, user);
  }

  @Get("payments")
  payments(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return this.reportsService.payments(eventId, user);
  }

  @Get("export.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  async exportCsv(
    @Param("eventId") eventId: string,
    @CurrentUser() user: AdminPrincipal,
    @Res() response: Response
  ) {
    const csv = await this.reportsService.exportCsv(eventId, user);

    response.setHeader("Content-Disposition", `attachment; filename="relatorio-${eventId}.csv"`);
    response.send(csv);
  }
}
