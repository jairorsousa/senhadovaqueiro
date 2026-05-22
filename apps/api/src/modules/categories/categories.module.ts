import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminCategoriesController } from "./controllers/admin-categories.controller";
import { PublicCategoriesController } from "./controllers/public-categories.controller";
import { CategoriesService } from "./services/categories.service";
import { PublicCategoriesService } from "./services/public-categories.service";

@Module({
  imports: [AuthModule],
  controllers: [AdminCategoriesController, PublicCategoriesController],
  providers: [CategoriesService, PublicCategoriesService]
})
export class CategoriesModule {}
