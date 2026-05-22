import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

type TokenKind = "admin" | "cowboy";

export type AuthTokenPayload = {
  sub: string;
  kind: TokenKind;
  role: string;
  iat: number;
  exp: number;
};

@Injectable()
export class JwtTokenService {
  constructor(private readonly config: ConfigService) {}

  sign(input: Omit<AuthTokenPayload, "iat" | "exp">, expiresInSeconds: number) {
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      ...input,
      iat: now,
      exp: now + expiresInSeconds
    };
    const header = this.encode({ alg: "HS256", typ: "JWT" });
    const body = this.encode(payload);
    const signature = this.signingInput(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  verify(token: string): AuthTokenPayload {
    const [header, body, signature] = token.split(".");

    if (!header || !body || !signature) {
      throw this.invalidToken();
    }

    const expected = this.signingInput(`${header}.${body}`);
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      throw this.invalidToken();
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AuthTokenPayload;

    if (
      !payload.sub ||
      !payload.kind ||
      !payload.exp ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw this.invalidToken();
    }

    return payload;
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
  }

  private signingInput(input: string) {
    return createHmac("sha256", this.config.getOrThrow<string>("JWT_ACCESS_SECRET"))
      .update(input)
      .digest("base64url");
  }

  private invalidToken() {
    return new UnauthorizedException({
      code: "INVALID_TOKEN",
      message: "Sessao invalida ou expirada."
    });
  }
}
