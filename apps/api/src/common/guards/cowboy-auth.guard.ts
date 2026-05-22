import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtTokenService } from "../../modules/auth/services/jwt-token.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class CowboyAuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractCookie(request.headers.cookie, "cowboy_access");

    if (!token) {
      throw new UnauthorizedException({
        code: "COWBOY_AUTH_REQUIRED",
        message: "Login do vaqueiro necessario."
      });
    }

    const payload = this.jwtTokenService.verify(token);

    if (payload.kind !== "cowboy") {
      throw new UnauthorizedException({
        code: "INVALID_COWBOY_SESSION",
        message: "Sessao do vaqueiro invalida."
      });
    }

    const cowboy = await this.prisma.cowboy.findFirst({
      where: {
        id: payload.sub,
        isActive: true
      }
    });

    if (!cowboy) {
      throw new UnauthorizedException({
        code: "INVALID_COWBOY_SESSION",
        message: "Sessao do vaqueiro invalida."
      });
    }

    request.auth = {
      kind: "cowboy",
      id: cowboy.id,
      cpf: cowboy.cpf,
      role: "COWBOY"
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
