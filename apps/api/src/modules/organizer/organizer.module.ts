import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OrganizerPanelController } from "./controllers/organizer-panel.controller";
import { OrganizerPanelService } from "./services/organizer-panel.service";

@Module({
  imports: [AuthModule],
  controllers: [OrganizerPanelController],
  providers: [OrganizerPanelService]
})
export class OrganizerModule {}
