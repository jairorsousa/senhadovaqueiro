import test from "node:test";
import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { EventAccessGuard } from "./event-access.guard";

function context(auth: unknown, eventId = "event-1") {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        auth,
        params: { eventId }
      })
    })
  };
}

test("permite SYSTEM_ADMIN em qualquer evento", async () => {
  const prisma = {
    eventUser: {
      findUnique: async () => {
        throw new Error("SYSTEM_ADMIN nao deve consultar vinculo");
      }
    }
  };
  const guard = new EventAccessGuard(prisma as never);

  await assert.doesNotReject(() =>
    guard.canActivate(context({ kind: "admin", id: "admin-1", role: "SYSTEM_ADMIN" }) as never)
  );
});

test("permite ORGANIZER vinculado ao evento", async () => {
  const prisma = {
    eventUser: {
      findUnique: async () => ({ id: "link-1" })
    }
  };
  const guard = new EventAccessGuard(prisma as never);

  await assert.equal(
    await guard.canActivate(context({ kind: "admin", id: "user-1", role: "ORGANIZER" }) as never),
    true
  );
});

test("bloqueia ORGANIZER sem vinculo com o evento", async () => {
  const prisma = {
    eventUser: {
      findUnique: async () => null
    }
  };
  const guard = new EventAccessGuard(prisma as never);

  await assert.rejects(
    () => guard.canActivate(context({ kind: "admin", id: "user-1", role: "ORGANIZER" }) as never),
    ForbiddenException
  );
});
