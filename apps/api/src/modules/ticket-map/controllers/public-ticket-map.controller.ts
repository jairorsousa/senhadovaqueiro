import { Controller, Get, Param } from "@nestjs/common";
import { PublicTicketMapService } from "../services/public-ticket-map.service";

@Controller("ticket-maps")
export class PublicTicketMapController {
  constructor(private readonly publicTicketMapService: PublicTicketMapService) {}

  @Get(":id/numbers")
  async numbers(@Param("id") id: string) {
    return {
      numbers: await this.publicTicketMapService.numbers(id)
    };
  }
}
