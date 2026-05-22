import { Body, Controller, Get, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { CowboyAuthGuard } from "../../../common/guards/cowboy-auth.guard";
import type { CowboyPrincipal } from "../../../common/types/authenticated-request";
import { AuthService } from "../../auth/services/auth.service";
import { CookieService } from "../../auth/services/cookie.service";
import { JwtTokenService } from "../../auth/services/jwt-token.service";
import { RateLimitService } from "../../auth/services/rate-limit.service";
import { CowboyLoginDto } from "../dto/cowboy-login.dto";
import { RegisterCowboyDto } from "../dto/register-cowboy.dto";

@Controller("cowboys")
export class CowboysAuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CookieService) private readonly cookieService: CookieService,
    @Inject(JwtTokenService) private readonly jwtTokenService: JwtTokenService,
    @Inject(RateLimitService) private readonly rateLimitService: RateLimitService
  ) {}

  @Post("login")
  async login(
    @Body() body: CowboyLoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const normalizedCpf = this.authService.normalizeCpf(body.cpf);
    this.rateLimitService.consume(`cowboy-login:${request.ip}:${normalizedCpf}`, 5, 60_000);

    const cowboy = await this.authService.validateCowboy(body.cpf, body.password);
    this.setCowboySession(response, cowboy.id);

    return {
      cowboy: this.presentCowboy(cowboy)
    };
  }

  @Post("register")
  async register(
    @Body() body: RegisterCowboyDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const normalizedCpf = this.authService.normalizeCpf(body.cpf);
    this.rateLimitService.consume(`cowboy-register:${request.ip}:${normalizedCpf}`, 3, 60_000);

    const cowboy = await this.authService.registerCowboy(body);
    this.setCowboySession(response, cowboy.id);

    return {
      cowboy: this.presentCowboy(cowboy)
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    this.cookieService.clearCowboyAccessToken(response);

    return {
      success: true
    };
  }

  @Get("me")
  @UseGuards(CowboyAuthGuard)
  me(@CurrentUser() cowboy: CowboyPrincipal) {
    return {
      cowboy
    };
  }

  private setCowboySession(response: Response, cowboyId: string) {
    const token = this.jwtTokenService.sign(
      {
        sub: cowboyId,
        kind: "cowboy",
        role: "COWBOY"
      },
      this.authService.accessTokenTtl()
    );

    this.cookieService.setCowboyAccessToken(response, token);
  }

  private presentCowboy(cowboy: { id: string; name: string; cpf: string; whatsapp: string }) {
    return {
      id: cowboy.id,
      name: cowboy.name,
      cpf: cowboy.cpf,
      whatsapp: cowboy.whatsapp
    };
  }
}
