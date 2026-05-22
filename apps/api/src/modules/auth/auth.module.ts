import { Module } from "@nestjs/common";
import { AdminAuthController } from "./controllers/admin-auth.controller";
import { AuthService } from "./services/auth.service";
import { CookieService } from "./services/cookie.service";
import { JwtTokenService } from "./services/jwt-token.service";
import { PasswordService } from "./services/password.service";
import { RateLimitService } from "./services/rate-limit.service";

@Module({
  controllers: [AdminAuthController],
  providers: [AuthService, CookieService, JwtTokenService, PasswordService, RateLimitService],
  exports: [AuthService, CookieService, JwtTokenService, PasswordService, RateLimitService]
})
export class AuthModule {}
