import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { CowboyAuthGuard } from "../../../common/guards/cowboy-auth.guard";
import type { CowboyPrincipal } from "../../../common/types/authenticated-request";
import { UpdateMyTicketDto } from "../dto/update-my-ticket.dto";
import { MyTicketsService } from "../services/my-tickets.service";

@Controller("me/tickets")
@UseGuards(CowboyAuthGuard)
export class MyTicketsController {
  constructor(private readonly myTicketsService: MyTicketsService) {}

  @Get()
  list(@CurrentUser() cowboy: CowboyPrincipal) {
    return this.myTicketsService.list(cowboy.id);
  }

  @Get(":id")
  find(@CurrentUser() cowboy: CowboyPrincipal, @Param("id") id: string) {
    return this.myTicketsService.find(cowboy.id, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() cowboy: CowboyPrincipal,
    @Param("id") id: string,
    @Body() body: UpdateMyTicketDto
  ) {
    return this.myTicketsService.update(cowboy.id, id, body);
  }

  @Get(":id/print")
  print(@CurrentUser() cowboy: CowboyPrincipal, @Param("id") id: string) {
    return this.myTicketsService.print(cowboy.id, id);
  }
}
