import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { validationExceptionFactory } from "./common/validation/validation-exception.factory";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  const config = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory
    })
  );

  app.enableCors({
    origin: config.get<string>("APP_URL") ?? "http://localhost:3000",
    credentials: true
  });

  const port = config.get<number>("API_PORT") ?? 3333;
  await app.listen(port, "0.0.0.0");

  logger.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
