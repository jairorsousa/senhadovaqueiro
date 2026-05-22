import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnvironment } from "./common/config/env.validation";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { CowboysModule } from "./modules/cowboys/cowboys.module";
import { EventDaysModule } from "./modules/event-days/event-days.module";
import { EventsModule } from "./modules/events/events.module";
import { OrganizerModule } from "./modules/organizer/organizer.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { TicketMapModule } from "./modules/ticket-map/ticket-map.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ["../../.env", ".env"],
      isGlobal: true,
      validate: validateEnvironment
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CowboysModule,
    EventsModule,
    CategoriesModule,
    EventDaysModule,
    TicketMapModule,
    OrganizerModule,
    CheckoutModule,
    PaymentsModule,
    ReportsModule,
    AuditModule
  ]
})
export class AppModule {}
