import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CowboysAuthController } from "./controllers/cowboys-auth.controller";
import { MyTicketsController } from "./controllers/my-tickets.controller";
import { MyTicketsService } from "./services/my-tickets.service";

@Module({
  imports: [AuthModule],
  controllers: [CowboysAuthController, MyTicketsController],
  providers: [MyTicketsService]
})
export class CowboysModule {}
