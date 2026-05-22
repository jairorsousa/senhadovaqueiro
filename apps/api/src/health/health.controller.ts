import { Controller, Get, Inject, Query } from "@nestjs/common";
import { HealthCheckQueryDto } from "./dto/health-check-query.dto";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  check(@Query() query: HealthCheckQueryDto) {
    return this.healthService.check(query.verbose === "true");
  }
}
