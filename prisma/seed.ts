import { createHash, randomBytes, scryptSync } from "node:crypto";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  admin: "11111111-1111-4111-8111-111111111111",
  organizer: "22222222-2222-4222-8222-222222222222",
  cowboy: "33333333-3333-4333-8333-333333333333",
  event: "44444444-4444-4444-8444-444444444444",
  categoryAberta: "55555555-5555-4555-8555-555555555555",
  categoryAspirante: "66666666-6666-4666-8666-666666666666",
  eventDay: "77777777-7777-4777-8777-777777777777",
  categoryDayAberta: "88888888-8888-4888-8888-888888888888",
  categoryDayAspirante: "99999999-9999-4999-8999-999999999999",
  ticketMapAberta: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  ticketMapAspirante: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  auditLog: "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
};

function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

function deterministicPassword(seed: string) {
  const salt = createHash("sha256").update(seed).digest("hex").slice(0, 32);
  const hash = scryptSync("change-me-now", salt, 64).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

async function main() {
  const adminPasswordHash =
    process.env.SEED_ADMIN_PASSWORD === undefined
      ? deterministicPassword("admin@senhadovaqueiro.local")
      : hashPassword(process.env.SEED_ADMIN_PASSWORD);

  const organizerPasswordHash =
    process.env.SEED_ORGANIZER_PASSWORD === undefined
      ? deterministicPassword("organizador@senhadovaqueiro.local")
      : hashPassword(process.env.SEED_ORGANIZER_PASSWORD);

  const cowboyPasswordHash =
    process.env.SEED_COWBOY_PASSWORD === undefined
      ? deterministicPassword("vaqueiro-demo")
      : hashPassword(process.env.SEED_COWBOY_PASSWORD);

  await prisma.user.upsert({
    where: { id: ids.admin },
    update: {
      name: "Administrador Senha do Vaqueiro",
      email: "admin@senhadovaqueiro.local",
      role: UserRole.SYSTEM_ADMIN,
      isActive: true
    },
    create: {
      id: ids.admin,
      name: "Administrador Senha do Vaqueiro",
      email: "admin@senhadovaqueiro.local",
      passwordHash: adminPasswordHash,
      role: UserRole.SYSTEM_ADMIN
    }
  });

  await prisma.user.upsert({
    where: { id: ids.organizer },
    update: {
      name: "Organizador Parque Modelo",
      email: "organizador@senhadovaqueiro.local",
      role: UserRole.ORGANIZER,
      isActive: true
    },
    create: {
      id: ids.organizer,
      name: "Organizador Parque Modelo",
      email: "organizador@senhadovaqueiro.local",
      passwordHash: organizerPasswordHash,
      role: UserRole.ORGANIZER
    }
  });

  await prisma.cowboy.upsert({
    where: { id: ids.cowboy },
    update: {
      name: "Vaqueiro Demo",
      cpf: normalizeCpf("123.456.789-09"),
      whatsapp: "5599999999999",
      isActive: true
    },
    create: {
      id: ids.cowboy,
      name: "Vaqueiro Demo",
      cpf: normalizeCpf("123.456.789-09"),
      whatsapp: "5599999999999",
      passwordHash: cowboyPasswordHash
    }
  });

  await prisma.event.upsert({
    where: { id: ids.event },
    update: {
      name: "Vaquejada Parque Modelo",
      slug: "vaquejada-parque-modelo",
      city: "Petrolina",
      state: "PE",
      location: "Parque Modelo",
      status: "ACTIVE"
    },
    create: {
      id: ids.event,
      name: "Vaquejada Parque Modelo",
      slug: "vaquejada-parque-modelo",
      city: "Petrolina",
      state: "PE",
      location: "Parque Modelo",
      description: "Vaquejada de exemplo para validar o site publico e o painel administrativo.",
      rules: "Chegue com antecedencia e confira sua senha antes da corrida.",
      startsAt: new Date("2026-07-10T12:00:00.000Z"),
      endsAt: new Date("2026-07-12T23:00:00.000Z"),
      status: "ACTIVE"
    }
  });

  await prisma.eventUser.upsert({
    where: {
      eventId_userId: {
        eventId: ids.event,
        userId: ids.organizer
      }
    },
    update: {
      role: UserRole.ORGANIZER
    },
    create: {
      eventId: ids.event,
      userId: ids.organizer,
      role: UserRole.ORGANIZER
    }
  });

  await prisma.category.upsert({
    where: { id: ids.categoryAberta },
    update: {
      name: "Aberta",
      ticketPrice: "250.00",
      prizeAmount: "10000.00",
      cattleCount: 2,
      usesDays: true,
      status: "ACTIVE",
      sortOrder: 1
    },
    create: {
      id: ids.categoryAberta,
      eventId: ids.event,
      name: "Aberta",
      description: "Categoria principal da vaquejada.",
      ticketPrice: "250.00",
      prizeAmount: "10000.00",
      cattleCount: 2,
      usesDays: true,
      status: "ACTIVE",
      sortOrder: 1
    }
  });

  await prisma.category.upsert({
    where: { id: ids.categoryAspirante },
    update: {
      name: "Aspirante",
      ticketPrice: "180.00",
      prizeAmount: "5000.00",
      cattleCount: 2,
      usesDays: true,
      status: "ACTIVE",
      sortOrder: 2
    },
    create: {
      id: ids.categoryAspirante,
      eventId: ids.event,
      name: "Aspirante",
      description: "Categoria para competidores aspirantes.",
      ticketPrice: "180.00",
      prizeAmount: "5000.00",
      cattleCount: 2,
      usesDays: true,
      status: "ACTIVE",
      sortOrder: 2
    }
  });

  await prisma.eventDay.upsert({
    where: { id: ids.eventDay },
    update: {
      name: "Sabado",
      startsAt: new Date("2026-07-11T12:00:00.000Z"),
      endsAt: new Date("2026-07-11T23:00:00.000Z"),
      sortOrder: 1
    },
    create: {
      id: ids.eventDay,
      eventId: ids.event,
      name: "Sabado",
      startsAt: new Date("2026-07-11T12:00:00.000Z"),
      endsAt: new Date("2026-07-11T23:00:00.000Z"),
      sortOrder: 1
    }
  });

  await prisma.categoryDay.upsert({
    where: {
      categoryId_eventDayId: {
        categoryId: ids.categoryAberta,
        eventDayId: ids.eventDay
      }
    },
    update: {},
    create: {
      id: ids.categoryDayAberta,
      categoryId: ids.categoryAberta,
      eventDayId: ids.eventDay
    }
  });

  await prisma.categoryDay.upsert({
    where: {
      categoryId_eventDayId: {
        categoryId: ids.categoryAspirante,
        eventDayId: ids.eventDay
      }
    },
    update: {},
    create: {
      id: ids.categoryDayAspirante,
      categoryId: ids.categoryAspirante,
      eventDayId: ids.eventDay
    }
  });

  await prisma.ticketMap.upsert({
    where: { id: ids.ticketMapAberta },
    update: {
      name: "Mapa Aberta - Sabado",
      firstNumber: 1,
      lastNumber: 30,
      status: "ACTIVE"
    },
    create: {
      id: ids.ticketMapAberta,
      eventId: ids.event,
      categoryId: ids.categoryAberta,
      eventDayId: ids.eventDay,
      name: "Mapa Aberta - Sabado",
      firstNumber: 1,
      lastNumber: 30,
      status: "ACTIVE"
    }
  });

  await prisma.ticketMap.upsert({
    where: { id: ids.ticketMapAspirante },
    update: {
      name: "Mapa Aspirante - Sabado",
      firstNumber: 1,
      lastNumber: 20,
      status: "ACTIVE"
    },
    create: {
      id: ids.ticketMapAspirante,
      eventId: ids.event,
      categoryId: ids.categoryAspirante,
      eventDayId: ids.eventDay,
      name: "Mapa Aspirante - Sabado",
      firstNumber: 1,
      lastNumber: 20,
      status: "ACTIVE"
    }
  });

  await prisma.ticketNumber.createMany({
    data: Array.from({ length: 30 }, (_, index) => ({
      ticketMapId: ids.ticketMapAberta,
      number: index + 1,
      status: "AVAILABLE" as const
    })),
    skipDuplicates: true
  });

  await prisma.ticketNumber.createMany({
    data: Array.from({ length: 20 }, (_, index) => ({
      ticketMapId: ids.ticketMapAspirante,
      number: index + 1,
      status: "AVAILABLE" as const
    })),
    skipDuplicates: true
  });

  await prisma.auditLog.deleteMany({
    where: {
      action: "seed.initialized",
      id: {
        not: ids.auditLog
      }
    }
  });

  await prisma.auditLog.upsert({
    where: { id: ids.auditLog },
    update: {
      metadata: {
        eventSlug: "vaquejada-parque-modelo",
        ticketNumbers: 50
      }
    },
    create: {
      id: ids.auditLog,
      userId: ids.admin,
      action: "seed.initialized",
      entityType: "events",
      entityId: ids.event,
      metadata: {
        eventSlug: "vaquejada-parque-modelo",
        ticketNumbers: 50
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
