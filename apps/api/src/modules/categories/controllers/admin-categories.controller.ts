import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { CreateCategoryDto } from "../dto/create-category.dto";
import { UpdateCategoryDto } from "../dto/update-category.dto";
import { CategoriesService } from "../services/categories.service";

@Controller("admin")
@UseGuards(AdminAuthGuard)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get("events/:eventId/categories")
  async list(@Param("eventId") eventId: string, @CurrentUser() user: AdminPrincipal) {
    return { categories: await this.categoriesService.list(eventId, user) };
  }

  @Post("events/:eventId/categories")
  create(
    @Param("eventId") eventId: string,
    @Body() body: CreateCategoryDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.categoriesService.create(eventId, body, user);
  }

  @Patch("categories/:id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateCategoryDto,
    @CurrentUser() user: AdminPrincipal
  ) {
    return this.categoriesService.update(id, body, user);
  }
}
