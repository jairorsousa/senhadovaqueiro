import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

type DependencyStatus = {
  status: "up" | "down";
  message?: string;
};

@Injectable()
export class HealthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService
  ) {}

  async check(verbose = false) {
    const [database, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);
    const status = database.status === "up" && redis.status === "up" ? "ok" : "degraded";

    return {
      status,
      services: {
        api: {
          status: "up"
        },
        database,
        redis
      },
      ...(verbose
        ? {
            runtime: {
              uptimeSeconds: Math.round(process.uptime()),
              nodeVersion: process.version
            }
          }
        : {}),
      timestamp: new Date().toISOString()
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return { status: "up" };
    } catch (error) {
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Falha ao consultar PostgreSQL."
      };
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    try {
      const pong = await this.redis.ping();

      return pong === "PONG" ? { status: "up" } : { status: "down", message: pong };
    } catch (error) {
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Falha ao consultar Redis."
      };
    }
  }
}
