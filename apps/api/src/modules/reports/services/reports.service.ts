import { ForbiddenException, Injectable } from "@nestjs/common";
import { PaymentStatus, Prisma, TicketStatus, UserRole } from "@prisma/client";
import type { AdminPrincipal } from "../../../common/types/authenticated-request";
import { PrismaService } from "../../../prisma/prisma.service";

const reportTicketInclude = {
  ticketMap: {
    include: {
      category: true,
      eventDay: true,
      event: true
    }
  },
  currentOrderItem: {
    include: {
      order: {
        include: {
          cowboy: true,
          payments: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1
          }
        }
      }
    }
  }
} satisfies Prisma.TicketNumberInclude;

const reportPaymentInclude = {
  order: {
    include: {
      cowboy: true,
      items: {
        include: {
          ticketNumber: {
            include: {
              ticketMap: {
                include: {
                  category: true,
                  eventDay: true
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.PaymentInclude;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const [tickets, payments] = await Promise.all([
      this.findTickets(eventId),
      this.findPayments(eventId)
    ]);

    return {
      totals: {
        tickets: tickets.length,
        ticketsSold: tickets.filter((ticket) => ticket.status === TicketStatus.PAID).length,
        revenueConfirmed: this.sumPayments(payments, PaymentStatus.PAID),
        revenuePending: this.sumPayments(payments, PaymentStatus.WAITING_PAYMENT),
        revenueTotal: this.sumPayments(payments)
      },
      byCategory: this.byCategory(tickets, payments),
      byDay: this.byDay(tickets, payments),
      byPaymentStatus: this.byPaymentStatus(payments)
    };
  }

  async tickets(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const tickets = await this.findTickets(eventId);

    return {
      tickets: tickets
        .filter((ticket) => ticket.status === TicketStatus.PAID)
        .map((ticket) => this.presentTicket(ticket))
    };
  }

  async payments(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const payments = await this.findPayments(eventId);

    return {
      payments: payments.map((payment) => this.presentPayment(payment)),
      byStatus: this.byPaymentStatus(payments)
    };
  }

  async exportCsv(eventId: string, principal: AdminPrincipal) {
    await this.assertEventAccess(eventId, principal);

    const tickets = await this.findTickets(eventId);
    const rows = tickets.map((ticket) => {
      const payment = ticket.currentOrderItem?.order.payments[0] ?? null;

      return [
        ticket.ticketMap.event.name,
        ticket.ticketMap.category.name,
        ticket.ticketMap.eventDay?.name ?? "Unico",
        ticket.number.toString(),
        ticket.status,
        ticket.currentOrderItem?.order.cowboy?.name ?? "",
        ticket.currentOrderItem?.order.cowboy?.cpf ?? "",
        ticket.currentOrderItem?.order.cowboy?.whatsapp ?? "",
        ticket.currentOrderItem?.order.status ?? "",
        payment?.status ?? "",
        payment?.amount.toString() ?? "",
        payment?.paidAt?.toISOString() ?? "",
        ticket.updatedAt.toISOString()
      ];
    });

    return this.toCsv([
      [
        "Evento",
        "Categoria",
        "Dia",
        "Numero",
        "Status da senha",
        "Vaqueiro",
        "CPF",
        "WhatsApp",
        "Status do pedido",
        "Status do pagamento",
        "Valor pago",
        "Pago em",
        "Atualizado em"
      ],
      ...rows
    ]);
  }

  private async findTickets(eventId: string) {
    return this.prisma.ticketNumber.findMany({
      where: {
        ticketMap: {
          eventId
        }
      },
      include: reportTicketInclude,
      orderBy: [{ ticketMap: { category: { sortOrder: "asc" } } }, { number: "asc" }]
    });
  }

  private async findPayments(eventId: string) {
    return this.prisma.payment.findMany({
      where: {
        order: {
          eventId
        }
      },
      include: reportPaymentInclude,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  private byCategory(tickets: ReportTicket[], payments: ReportPayment[]) {
    const grouped = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        ticketsSold: number;
        revenueConfirmed: number;
        revenuePending: number;
      }
    >();

    for (const ticket of tickets) {
      const category = ticket.ticketMap.category;
      const current = grouped.get(category.id) ?? {
        categoryId: category.id,
        categoryName: category.name,
        ticketsSold: 0,
        revenueConfirmed: 0,
        revenuePending: 0
      };

      if (ticket.status === TicketStatus.PAID) current.ticketsSold += 1;
      grouped.set(category.id, current);
    }

    for (const payment of payments) {
      const category = payment.order.items[0]?.ticketNumber.ticketMap.category;
      if (!category) continue;

      const current = grouped.get(category.id) ?? {
        categoryId: category.id,
        categoryName: category.name,
        ticketsSold: 0,
        revenueConfirmed: 0,
        revenuePending: 0
      };

      if (payment.status === PaymentStatus.PAID) current.revenueConfirmed += Number(payment.amount);
      if (payment.status === PaymentStatus.WAITING_PAYMENT) {
        current.revenuePending += Number(payment.amount);
      }
      grouped.set(category.id, current);
    }

    return [...grouped.values()].map((item) => ({
      ...item,
      revenueConfirmed: item.revenueConfirmed.toFixed(2),
      revenuePending: item.revenuePending.toFixed(2)
    }));
  }

  private byDay(tickets: ReportTicket[], payments: ReportPayment[]) {
    const grouped = new Map<
      string,
      {
        eventDayId: string | null;
        dayName: string;
        ticketsSold: number;
        revenueConfirmed: number;
        revenuePending: number;
      }
    >();

    for (const ticket of tickets) {
      const day = ticket.ticketMap.eventDay;
      const key = day?.id ?? "single";
      const current = grouped.get(key) ?? {
        eventDayId: day?.id ?? null,
        dayName: day?.name ?? "Unico",
        ticketsSold: 0,
        revenueConfirmed: 0,
        revenuePending: 0
      };

      if (ticket.status === TicketStatus.PAID) current.ticketsSold += 1;
      grouped.set(key, current);
    }

    for (const payment of payments) {
      const day = payment.order.items[0]?.ticketNumber.ticketMap.eventDay;
      const key = day?.id ?? "single";
      const current = grouped.get(key) ?? {
        eventDayId: day?.id ?? null,
        dayName: day?.name ?? "Unico",
        ticketsSold: 0,
        revenueConfirmed: 0,
        revenuePending: 0
      };

      if (payment.status === PaymentStatus.PAID) current.revenueConfirmed += Number(payment.amount);
      if (payment.status === PaymentStatus.WAITING_PAYMENT) {
        current.revenuePending += Number(payment.amount);
      }
      grouped.set(key, current);
    }

    return [...grouped.values()].map((item) => ({
      ...item,
      revenueConfirmed: item.revenueConfirmed.toFixed(2),
      revenuePending: item.revenuePending.toFixed(2)
    }));
  }

  private byPaymentStatus(payments: ReportPayment[]) {
    const grouped = new Map<
      PaymentStatus,
      { status: PaymentStatus; count: number; amount: number }
    >();

    for (const payment of payments) {
      const current = grouped.get(payment.status) ?? {
        status: payment.status,
        count: 0,
        amount: 0
      };
      current.count += 1;
      current.amount += Number(payment.amount);
      grouped.set(payment.status, current);
    }

    return [...grouped.values()].map((item) => ({
      ...item,
      amount: item.amount.toFixed(2)
    }));
  }

  private presentTicket(ticket: ReportTicket) {
    const order = ticket.currentOrderItem?.order ?? null;
    const payment = order?.payments[0] ?? null;

    return {
      id: ticket.id,
      number: ticket.number,
      status: ticket.status,
      category: {
        id: ticket.ticketMap.category.id,
        name: ticket.ticketMap.category.name
      },
      day: ticket.ticketMap.eventDay
        ? {
            id: ticket.ticketMap.eventDay.id,
            name: ticket.ticketMap.eventDay.name
          }
        : null,
      cowboy: order?.cowboy
        ? {
            id: order.cowboy.id,
            name: order.cowboy.name,
            cpf: order.cowboy.cpf,
            whatsapp: order.cowboy.whatsapp
          }
        : null,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amount: payment.amount.toString(),
            paidAt: payment.paidAt?.toISOString() ?? null
          }
        : null
    };
  }

  private presentPayment(payment: ReportPayment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount.toString(),
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      cowboy: payment.order.cowboy
        ? {
            id: payment.order.cowboy.id,
            name: payment.order.cowboy.name,
            cpf: payment.order.cowboy.cpf
          }
        : null,
      tickets: payment.order.items.map((item) => ({
        id: item.ticketNumber.id,
        number: item.ticketNumber.number,
        category: item.ticketNumber.ticketMap.category.name,
        day: item.ticketNumber.ticketMap.eventDay?.name ?? "Unico"
      }))
    };
  }

  private sumPayments(payments: ReportPayment[], status?: PaymentStatus) {
    return payments
      .filter((payment) => (status ? payment.status === status : true))
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
      .toFixed(2);
  }

  private toCsv(rows: string[][]) {
    const body = rows
      .map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(";"))
      .join("\n");

    return `\uFEFF${body}\n`;
  }

  private escapeCsvCell(value: string) {
    const escaped = value.replaceAll('"', '""');
    return `"${escaped}"`;
  }

  private async assertEventAccess(eventId: string, principal: AdminPrincipal) {
    if (principal.role === UserRole.SYSTEM_ADMIN) return;

    const link = await this.prisma.eventUser.findUnique({
      where: { eventId_userId: { eventId, userId: principal.id } }
    });

    if (!link) {
      throw new ForbiddenException({
        code: "EVENT_ACCESS_DENIED",
        message: "Voce nao tem acesso a esta vaquejada."
      });
    }
  }
}

type ReportTicket = Prisma.TicketNumberGetPayload<{ include: typeof reportTicketInclude }>;
type ReportPayment = Prisma.PaymentGetPayload<{ include: typeof reportPaymentInclude }>;
