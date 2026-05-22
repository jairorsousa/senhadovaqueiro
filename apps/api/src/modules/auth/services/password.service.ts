import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordService {
  hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");

    return `scrypt:${salt}:${hash}`;
  }

  verify(password: string, storedHash: string) {
    const [algorithm, salt, hash] = storedHash.split(":");

    if (algorithm !== "scrypt" || !salt || !hash) {
      return false;
    }

    const hashBuffer = Buffer.from(hash, "hex");
    const candidate = scryptSync(password, salt, hashBuffer.length);

    if (candidate.length !== hashBuffer.length) {
      return false;
    }

    return timingSafeEqual(candidate, hashBuffer);
  }
}
