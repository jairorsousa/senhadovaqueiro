import test from "node:test";
import assert from "node:assert/strict";
import { UnprocessableEntityException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";

test("normaliza CPF e WhatsApp ao cadastrar vaqueiro", async () => {
  const created: unknown[] = [];
  const prisma = {
    cowboy: {
      findUnique: async () => null,
      create: async ({ data }: { data: unknown }) => {
        created.push(data);
        return data;
      }
    }
  };
  const service = new AuthService(prisma as never, new PasswordService());

  await service.registerCowboy({
    name: "  Vaqueiro Teste  ",
    cpf: "123.456.789-01",
    whatsapp: "(87) 99999-0000",
    password: "change-me-now"
  });

  assert.deepEqual(
    created.map((item) => ({
      name: (item as { name: string }).name,
      cpf: (item as { cpf: string }).cpf,
      whatsapp: (item as { whatsapp: string }).whatsapp
    })),
    [{ name: "Vaqueiro Teste", cpf: "12345678901", whatsapp: "87999990000" }]
  );
});

test("rejeita CPF com quantidade invalida de digitos", async () => {
  const prisma = {
    cowboy: {
      findUnique: async () => null,
      create: async () => {
        throw new Error("nao deveria cadastrar");
      }
    }
  };
  const service = new AuthService(prisma as never, new PasswordService());

  await assert.rejects(
    () =>
      service.registerCowboy({
        name: "Vaqueiro Teste",
        cpf: "123",
        whatsapp: "(87) 99999-0000",
        password: "change-me-now"
      }),
    UnprocessableEntityException
  );
});
