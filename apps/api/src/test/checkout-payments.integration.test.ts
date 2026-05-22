import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { ConflictException } from "@nestjs/common";
import {
  CategoryStatus,
  EventStatus,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  TicketStatus
} from "@prisma/client";
import { PasswordService } from "../modules/auth/services/password.service";
import { CheckoutService } from "../modules/checkout/services/checkout.service";
import { FakePixPaymentProvider } from "../modules/payments/providers/fake-pix-payment.provider";
import { PaymentsService } from "../modules/payments/services/payments.service";

const databaseUrl = process.env.DATABASE_URL;
const prefix = `fase13-${randomUUID()}`;

if (!databaseUrl) {
  test("testes de integracao ignorados sem DATABASE_URL", (t) => {
    t.skip("Defina DATABASE_URL para executar os fluxos reais de banco.");
  });
} else {
  describe("checkout, pagamentos e concorrencia", () => {
    const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
    const checkout = new CheckoutService(prisma as never, new PasswordService());
    const payments = new PaymentsService(
      prisma as never,
      {
        get: (key: string) => {
          if (key === "PIX_PROVIDER") return "fake";
          if (key === "PIX_WEBHOOK_SECRET") return "dev-pix-secret";
          return undefined;
        }
      } as never,
      new FakePixPaymentProvider()
    );

    before(async () => {
      await prisma.$connect();
    });

    after(async () => {
      await prisma.order.deleteMany({
        where: {
          event: {
            slug: {
              startsWith: prefix
            }
          }
        }
      });
      await prisma.event.deleteMany({
        where: {
          slug: {
            startsWith: prefix
          }
        }
      });
      await prisma.order.deleteMany({
        where: {
          cowboy: {
            cpf: {
              startsWith: "99113"
            }
          }
        }
      });
      await prisma.cowboy.deleteMany({
        where: {
          cpf: {
            startsWith: "99113"
          }
        }
      });
      await prisma.$disconnect();
    });

    test("cria evento, categoria, mapa, publica e reserva senhas disponiveis", async () => {
      const scenario = await createScenario(prisma, "reserva", 3);
      const [firstTicket, secondTicket] = scenario.tickets;
      assert.ok(firstTicket);
      assert.ok(secondTicket);

      await prisma.event.update({
        where: { id: scenario.event.id },
        data: { status: EventStatus.ACTIVE }
      });

      const order = await checkout.reserve({
        eventId: scenario.event.id,
        categoryId: scenario.category.id,
        eventDayId: scenario.day.id,
        ticketNumberIds: [firstTicket.id, secondTicket.id]
      });

      assert.equal(order.status, OrderStatus.DRAFT);
      assert.equal(order.totalAmount, "500");
      assert.equal(order.items.length, 2);

      const reserved = await prisma.ticketNumber.findMany({
        where: {
          id: {
            in: [firstTicket.id, secondTicket.id]
          }
        },
        orderBy: { number: "asc" }
      });

      assert.deepEqual(
        reserved.map((ticket) => ticket.status),
        [TicketStatus.RESERVED, TicketStatus.RESERVED]
      );

      await assert.rejects(
        () =>
          checkout.reserve({
            eventId: scenario.event.id,
            categoryId: scenario.category.id,
            eventDayId: scenario.day.id,
            ticketNumberIds: [firstTicket.id]
          }),
        ConflictException
      );
    });

    test("confirma webhook Pix, ignora webhook duplicado e marca senhas como pagas", async () => {
      const scenario = await createScenario(prisma, "webhook", 1);
      const [ticket] = scenario.tickets;
      assert.ok(ticket);
      const order = await checkout.reserve({
        eventId: scenario.event.id,
        categoryId: scenario.category.id,
        eventDayId: scenario.day.id,
        ticketNumberIds: [ticket.id]
      });

      await checkout.identify(order.id, {
        name: "Vaqueiro Pix",
        cpf: "991.130.000-01",
        whatsapp: "(87) 99999-0001",
        password: "change-me-now"
      });

      const payment = await payments.createCheckoutPayment(order.id);
      assert.equal(payment.status, PaymentStatus.WAITING_PAYMENT);

      const externalEventId = `${prefix}-pix-confirmado`;
      const confirmed = await payments.handleWebhook(
        "fake",
        {
          providerPaymentId: payment.providerPaymentId,
          externalEventId,
          status: "PAID",
          secret: "dev-pix-secret"
        },
        "dev-pix-secret"
      );
      const duplicated = await payments.handleWebhook(
        "fake",
        {
          providerPaymentId: payment.providerPaymentId,
          externalEventId,
          status: "PAID",
          secret: "dev-pix-secret"
        },
        "dev-pix-secret"
      );

      assert.equal(confirmed.duplicated, false);
      assert.equal(confirmed.payment?.status, PaymentStatus.PAID);
      assert.equal(duplicated.duplicated, true);

      const [storedOrder, storedTicket] = await Promise.all([
        prisma.order.findUniqueOrThrow({ where: { id: order.id } }),
        prisma.ticketNumber.findUniqueOrThrow({ where: { id: ticket.id } })
      ]);

      assert.equal(storedOrder.status, OrderStatus.PAID);
      assert.equal(storedTicket.status, TicketStatus.PAID);
    });

    test("expira pagamento pendente e libera senha", async () => {
      const scenario = await createScenario(prisma, "expira", 1);
      const [ticket] = scenario.tickets;
      assert.ok(ticket);
      const order = await checkout.reserve({
        eventId: scenario.event.id,
        categoryId: scenario.category.id,
        eventDayId: scenario.day.id,
        ticketNumberIds: [ticket.id]
      });

      await checkout.identify(order.id, {
        name: "Vaqueiro Expira",
        cpf: "991.130.000-02",
        whatsapp: "(87) 99999-0002",
        password: "change-me-now"
      });
      const payment = await payments.createCheckoutPayment(order.id);

      await prisma.payment.update({
        where: { id: payment.id },
        data: { expiresAt: new Date(Date.now() - 60_000) }
      });

      await payments.expirePendingPayments();

      const [expiredPayment, expiredOrder, releasedTicket] = await Promise.all([
        prisma.payment.findUniqueOrThrow({ where: { id: payment.id } }),
        prisma.order.findUniqueOrThrow({ where: { id: order.id } }),
        prisma.ticketNumber.findUniqueOrThrow({ where: { id: ticket.id } })
      ]);

      assert.equal(expiredPayment.status, PaymentStatus.EXPIRED);
      assert.equal(expiredOrder.status, OrderStatus.EXPIRED);
      assert.equal(releasedTicket.status, TicketStatus.AVAILABLE);
      assert.equal(releasedTicket.currentOrderItemId, null);
    });

    test("apenas uma reserva concorrente vence para a mesma senha", async () => {
      const scenario = await createScenario(prisma, "concorrencia", 1);
      const [ticketNumber] = scenario.tickets;
      assert.ok(ticketNumber);
      const input = {
        eventId: scenario.event.id,
        categoryId: scenario.category.id,
        eventDayId: scenario.day.id,
        ticketNumberIds: [ticketNumber.id]
      };

      const results = await Promise.allSettled([checkout.reserve(input), checkout.reserve(input)]);
      const fulfilled = results.filter((result) => result.status === "fulfilled");
      const rejected = results.filter((result) => result.status === "rejected");

      assert.equal(fulfilled.length, 1);
      assert.equal(rejected.length, 1);
      assert.equal(
        String((rejected[0] as PromiseRejectedResult).reason.message),
        "Essa senha acabou de ser selecionada por outra pessoa."
      );

      const sales = await prisma.orderItem.count({
        where: { ticketNumberId: ticketNumber.id }
      });
      const ticket = await prisma.ticketNumber.findUniqueOrThrow({
        where: { id: ticketNumber.id }
      });

      assert.equal(sales, 1);
      assert.equal(ticket.status, TicketStatus.RESERVED);
    });
  });
}

async function createScenario(prisma: PrismaClient, slugSuffix: string, ticketCount: number) {
  const suffix = `${slugSuffix}-${randomUUID()}`;
  const event = await prisma.event.create({
    data: {
      name: `Fase 13 ${slugSuffix}`,
      slug: `${prefix}-${suffix}`,
      city: "Petrolina",
      state: "PE",
      location: "Parque de Testes",
      startsAt: new Date("2026-07-10T12:00:00.000Z"),
      endsAt: new Date("2026-07-12T12:00:00.000Z"),
      status: EventStatus.DRAFT
    }
  });
  const category = await prisma.category.create({
    data: {
      eventId: event.id,
      name: "Aberta",
      ticketPrice: "250.00",
      usesDays: true,
      status: CategoryStatus.ACTIVE
    }
  });
  const day = await prisma.eventDay.create({
    data: {
      eventId: event.id,
      name: "Sexta",
      startsAt: new Date("2026-07-10T12:00:00.000Z"),
      endsAt: new Date("2026-07-10T22:00:00.000Z")
    }
  });

  await prisma.categoryDay.create({
    data: {
      categoryId: category.id,
      eventDayId: day.id
    }
  });

  const ticketMap = await prisma.ticketMap.create({
    data: {
      eventId: event.id,
      categoryId: category.id,
      eventDayId: day.id,
      name: "Mapa principal",
      firstNumber: 1,
      lastNumber: ticketCount,
      status: CategoryStatus.ACTIVE
    }
  });

  await prisma.ticketNumber.createMany({
    data: Array.from({ length: ticketCount }, (_, index) => ({
      ticketMapId: ticketMap.id,
      number: index + 1,
      status: TicketStatus.AVAILABLE
    }))
  });

  const tickets = await prisma.ticketNumber.findMany({
    where: { ticketMapId: ticketMap.id },
    orderBy: { number: "asc" }
  });

  return { event, category, day, ticketMap, tickets };
}
