import { Controller, Get, Param } from "@nestjs/common";
import { PublicCategoriesService } from "../services/public-categories.service";

@Controller("categories")
export class PublicCategoriesController {
  constructor(private readonly publicCategoriesService: PublicCategoriesService) {}

  @Get(":id/days")
  async days(@Param("id") id: string) {
    return {
      days: await this.publicCategoriesService.days(id)
    };
  }
}
