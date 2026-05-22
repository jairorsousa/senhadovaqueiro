import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import type { Request, Response } from "express";

type ErrorResponse = {
  message?: string | string[];
  error?: string;
  code?: string;
  details?: unknown;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = this.toPayload(exception, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Erro nao tratado em ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    response.status(status).json({
      success: false,
      error: payload,
      meta: {
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      }
    });
  }

  private toPayload(exception: unknown, status: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const body =
        typeof response === "string" ? { message: response } : (response as ErrorResponse);

      return {
        code: body.code ?? body.error ?? HttpStatus[status] ?? "HTTP_ERROR",
        message: body.message ?? exception.message,
        details: body.details ?? null
      };
    }

    return {
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocorreu um erro inesperado.",
      details: null
    };
  }
}
