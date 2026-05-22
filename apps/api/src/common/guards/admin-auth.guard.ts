import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { UserRole } from "@prisma/client";
import { JwtTokenService } from "../../modules/auth/services/jwt-token.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractCookie(request.headers.cookie, "admin_access");

    if (!token) {
      throw new UnauthorizedException({
        code: "ADMIN_AUTH_REQUIRED",
        message: "Login administrativo necessario."
      });
    }

    const payload = this.jwtTokenService.verify(token);

    if (payload.kind !== "admin") {
      throw new UnauthorizedException({
        code: "INVALID_ADMIN_SESSION",
        message: "Sessao administrativa invalida."
      });
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
        role: {
          in: ["SYSTEM_ADMIN", "ORGANIZER"]
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException({
        code: "INVALID_ADMIN_SESSION",
        message: "Sessao administrativa invalida."
      });
    }

    request.auth = {
      kind: "admin",
      id: user.id,
      role: user.role as Exclude<UserRole, "COWBOY">,
      email: user.email
    };

    return true;
  }

  private extractCookie(cookieHeader: string | undefined, name: string) {
    return cookieHeader
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.slice(name.length + 1);
  }
}
