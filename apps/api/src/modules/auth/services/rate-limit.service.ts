import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  consume(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + windowMs
      });

      return;
    }

    current.count += 1;

    if (current.count > limit) {
      throw new HttpException(
        {
          code: "RATE_LIMITED",
          message: "Muitas tentativas. Aguarde um pouco e tente novamente."
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
  }
}
