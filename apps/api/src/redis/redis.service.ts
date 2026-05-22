import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client?: RedisClientType;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>("REDIS_URL");

    if (!url) {
      throw new Error("REDIS_URL nao foi definido.");
    }

    this.client = createClient({ url });
    this.client.on("error", (error) => {
      this.logger.error("Erro no Redis.", error instanceof Error ? error.stack : String(error));
    });

    await this.client.connect();
    this.logger.log("Redis conectado.");
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  async ping() {
    if (!this.client?.isOpen) {
      throw new Error("Cliente Redis nao conectado.");
    }

    return this.client.ping();
  }
}
