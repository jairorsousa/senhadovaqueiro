import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Roles } from "../../../common/decorators/roles.decorator";
import { AdminAuthGuard } from "../../../common/guards/admin-auth.guard";
import { RoleGuard } from "../../../common/guards/role.guard";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { AdminLoginDto } from "../dto/admin-login.dto";
import { AuthService } from "../services/auth.service";
import { CookieService } from "../services/cookie.service";
import { JwtTokenService } from "../services/jwt-token.service";
import { RateLimitService } from "../services/rate-limit.service";

@Controller("admin/auth")
export class AdminAuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CookieService) private readonly cookieService: CookieService,
    @Inject(JwtTokenService) private readonly jwtTokenService: JwtTokenService,
    @Inject(RateLimitService) private readonly rateLimitService: RateLimitService
  ) {}

  @Post("login")
  async login(
    @Body() body: AdminLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    this.rateLimitService.consume(`admin-login:${request.ip}:${body.email}`, 5, 60_000);

    const user = await this.authService.validateAdmin(body.email, body.password);
    const token = this.jwtTokenService.sign(
      {
        sub: user.id,
        kind: "admin",
        role: user.role
      },
      this.authService.accessTokenTtl()
    );

    this.cookieService.setAdminAccessToken(response, token);

    return {
      user: this.presentAdmin(user)
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    this.cookieService.clearAdminAccessToken(response);

    return {
      success: true
    };
  }

  @Get("me")
  @UseGuards(AdminAuthGuard, RoleGuard)
  @Roles("SYSTEM_ADMIN", "ORGANIZER")
  me(@CurrentUser() user: AdminPrincipal) {
    return {
      user
    };
  }

  private presentAdmin(user: { id: string; name: string; email: string; role: string }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}
