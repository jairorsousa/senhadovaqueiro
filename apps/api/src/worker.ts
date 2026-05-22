import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Worker");
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true
  });

  logger.log("Worker started without HTTP listener.");

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.log(`Received ${signal}. Closing worker context.`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

void bootstrap();
