import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  setAdminAccessToken(response: Response, token: string) {
    this.setCookie(response, "admin_access", token);
  }

  setCowboyAccessToken(response: Response, token: string) {
    this.setCookie(response, "cowboy_access", token);
  }

  clearAdminAccessToken(response: Response) {
    this.clearCookie(response, "admin_access");
  }

  clearCowboyAccessToken(response: Response) {
    this.clearCookie(response, "cowboy_access");
  }

  private setCookie(response: Response, name: string, value: string) {
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.config.get<string>("COOKIE_SECURE") === "true",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_MS,
      path: "/",
      domain: this.cookieDomain()
    });
  }

  private clearCookie(response: Response, name: string) {
    response.clearCookie(name, {
      httpOnly: true,
      secure: this.config.get<string>("COOKIE_SECURE") === "true",
      sameSite: "lax",
      path: "/",
      domain: this.cookieDomain()
    });
  }

  private cookieDomain() {
    const domain = this.config.get<string>("COOKIE_DOMAIN");

    return domain === "localhost" ? undefined : domain;
  }
}
