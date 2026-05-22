import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class EventAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const eventId = this.extractEventId(request);
    const principal = request.auth;

    if (!eventId || !principal || principal.kind !== "admin") {
      throw new ForbiddenException({
        code: "EVENT_ACCESS_DENIED",
        message: "Acesso a vaquejada negado."
      });
    }

    if (principal.role === "SYSTEM_ADMIN") {
      return true;
    }

    const link = await this.prisma.eventUser.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: principal.id
        }
      }
    });

    if (link) {
      return true;
    }

    throw new ForbiddenException({
      code: "EVENT_ACCESS_DENIED",
      message: "Voce nao tem acesso a esta vaquejada."
    });
  }

  private extractEventId(request: AuthenticatedRequest) {
    const params = request.params as Record<string, string | undefined>;

    return params.eventId ?? params.id;
  }
}
