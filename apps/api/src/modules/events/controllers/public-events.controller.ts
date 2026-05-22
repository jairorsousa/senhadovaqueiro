import { Controller, Get, Param, Query } from "@nestjs/common";
import { PublicEventsQueryDto } from "../dto/public-events-query.dto";
import { PublicEventsService } from "../services/public-events.service";

@Controller("events")
export class PublicEventsController {
  constructor(private readonly publicEventsService: PublicEventsService) {}

  @Get()
  async list(@Query() query: PublicEventsQueryDto) {
    return {
      events: await this.publicEventsService.list(query.q)
    };
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.publicEventsService.findBySlug(slug);
  }

  @Get(":id/categories")
  async categories(@Param("id") id: string) {
    return {
      categories: await this.publicEventsService.categories(id)
    };
  }
}
